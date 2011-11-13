# Copyright (c) 2010-2011 Robin Jarry
#
# This file is part of EVE Corporation Management.
#
# EVE Corporation Management is free software: you can redistribute it and/or
# modify it under the terms of the GNU General Public License as published by
# the Free Software Foundation, either version 3 of the License, or (at your
# option) any later version.
#
# EVE Corporation Management is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY
# or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for
# more details.
#
# You should have received a copy of the GNU General Public License along with
# EVE Corporation Management. If not, see <http://www.gnu.org/licenses/>.

__date__ = "2011 11 8"
__author__ = "diabeteman"

from django.conf.urls.defaults import patterns

urlpatterns = patterns('ecm.plugins.industry.views',
    ###########################################################################
    # INDUSTRY VIEWS
    (r'^search/data$',          'search_item'),
    (r'^search/itemid$',        'get_item_id'),

    (r'^orders/$',       'order.all'),
    (r'^orders/all/data/$',       'order.all_data'),

    (r'^orders/create/$',       'order.create'),
    (r'^orders/(\d+)/$',        'order.details'),
    (r'^orders/(\d+)/(\w+)/$',  'order.change_state'),


    (r'^catalog/$',             'catalog.catalog'),
    (r'^catalog/update/$',      'catalog.update'),
    (r'^catalog/data/$',        'catalog.catalog_data'),
    (r'^catalog/(\d+)/$',       'catalog.item_details'),
    (r'^catalog/(\d+)/addblueprint/$',       'catalog.add_blueprint'),

)

