# The MIT License - EVE Corporation Management
# 
# Copyright (c) 2010 Robin Jarry
# 
# Permission is hereby granted, free of charge, to any person obtaining a copy
# of this software and associated documentation files (the "Software"), to deal
# in the Software without restriction, including without limitation the rights
# to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
# copies of the Software, and to permit persons to whom the Software is
# furnished to do so, subject to the following conditions:
# 
# The above copyright notice and this permission notice shall be included in
# all copies or substantial portions of the Software.
# 
# THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
# IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
# FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
# AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
# LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
# OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
# THE SOFTWARE.

__date__ = "2011-03-27"
__author__ = "diabeteman"




from django.db import transaction
from ecm.core import api
from ecm.core.parsers import utils

import logging
from ecm.data.corp.models import Wallet
from ecm.data.accounting.models import JournalEntry
from django.db.models.aggregates import Max

logger = logging.getLogger(__name__)

#------------------------------------------------------------------------------
@transaction.commit_manually
def update():
    """
    Updates all wallets with the missing accounting entries since last scan.
    """
    try:
        for wallet in Wallet.objects.all():
            update_wallet(wallet)
        logger.debug("saving data to the database...")
        transaction.commit()
        logger.debug("update sucessfull")
    except:
        # error catched, rollback changes
        transaction.rollback()
        logger.exception("update failed")


def update_wallet(wallet):
    lastKnownID = JournalEntry.objects.filter(wallet=wallet).aggregate(Max("refID")).get("refID__max")
    if not lastKnownID: lastKnownID = 0
    entries = fetch_entries(wallet, lastKnownID)
    
    logger.info("parsing results...")
    for e in entries: 
        entry = JournalEntry()
        entry.refID      = e.refID
        entry.wallet     = wallet
        entry.date       = e.date
        entry.type_id    = e.refTypeID
        entry.ownerName1 = e.ownerName1
        entry.ownerID1   = e.ownerID1
        entry.ownerName2 = e.ownerName2
        entry.ownerID2   = e.ownerID2
        entry.argName1   = e.argName1
        entry.argID1     = e.argID1
        entry.amount     = e.amount
        entry.balance    = e.balance
        entry.reason     = e.reason
        entry.save()
    logger.debug("%d entries added in journal" % len(entries))


def fetch_entries(wallet, lastKnownID):
    api_conn = api.connect()
    
    logger.info("fetching /corp/WalletJournal.xml.aspx "
                "(accountKey=%d)..." % wallet.walletID)
    charID = api.get_api().charID
    walletsApi = api_conn.corp.WalletJournal(characterID=charID, 
                                            accountKey=wallet.walletID, 
                                            rowCount=256)
    utils.checkApiVersion(walletsApi._meta.version)   
    
    entries = list(walletsApi.entries)
    minID = min([e.refID for e in walletsApi.entries])
    
    # after the first fetch, we perform "journal walking" 
    # only if we got 256 entries in the response 
    # or if the lastKnownID is in the current 256 entries
    while not (len(walletsApi.entries) < 256 or minID < lastKnownID):
        logger.info("fetching /corp/WalletJournal.xml.aspx "
                    "(accountKey=%d, fromID=%d)..." % (wallet.walletID, minID))
        walletsApi = api_conn.corp.WalletJournal(characterID=charID, 
                                                 accountKey=wallet.walletID, 
                                                 fromID=minID,
                                                 rowCount=256)
        utils.checkApiVersion(walletsApi._meta.version)
        entries.extend(list(walletsApi.entries))
        minID = min([e.refID for e in walletsApi.entries])
    
    # we sort the entries backwards in order to remove 
    # the ones we already have in the database
    entries.reverse()
    i = 0
    while i < len(entries):
        if entries[i].refID > lastKnownID:
            # no need to go further, as refIDs are sorted in increasing order
            break
        else:
            # we already have this entry, no need to keep it
            del entries[i]
    
    return entries