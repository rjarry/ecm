/*************************
 * "Catalog" table setup *
 *************************/
/**
 * Needs global constants to be defined in the HTML page.
 *      - AJAX_URL
 *      - DISPLAY_MODE
 **/
$(document).ready(function() {

    var table = $('#catalog_table').dataTable( {
        "sPaginationType": "full_numbers",
        "bProcessing": true,
        "bServerSide": true,
        "bAutoWidth": false,
        "iDisplayLength": 25, 		/* default display 25 items */
        "bStateSave": true, 		/* table state persistance */
        "iCookieDuration": 60 * 60, /* persistance duration 1 hour */
        "sAjaxSource": AJAX_URL,
        "sDom": 'lprtip', 			/* table layout. see http://www.datatables.net/usage/options */
        "aoColumns": [
            { /* 0 Item */         "sWidth": "50%" },
            { /* 1 Available */    "sWidth": "10%", "sClass": "center"},
            { /* 2 Blueprints */   "sWidth": "5%" },
            { /* 3 Ordered */ 	   "sWidth": "5%" },
            { /* 4 typeID */      "bVisible": false },
        ],
        "fnRowCallback": function( nRow, aData, iDisplayIndex, iDisplayIndexFull ) {
            var available = aData[1];
            var typeID = aData[4];
            var params = 'name="' + typeID + '" ';
            if (available == 'true') {
                params += 'checked ';
            }
            $('td:eq(1)', nRow).html('<input type="checkbox" ' + params + '/>');
            $('td:eq(4)', nRow).hide();
            return nRow;
        },

        /* this function will be called when the table has to query data to be displayed */
        "fnServerData": function ( sSource, aoData, fnCallback ) {
            /* Add some extra variables to the url */
            aoData.push( {
                "name": "showUnavailable",
                "value": SHOW_UNAVAILABLE
            } );
            $.getJSON( sSource, aoData, function (json) {
                fnCallback(json)
            } );
        },

        /* the search field being outside the table object, we need to save its status
         * explicitly here in order to restore it with the rest */
        "fnStateSaveCallback": function (oSettings, sValue) {
            var sFilter = $("#search_text").val();
            sValue = sValue.replace( /"sFilter":".*?"/, '"sFilter":"' + sFilter + '"' );
            sValue += ', "showUnavailable": ' + SHOW_UNAVAILABLE;
            return sValue;
        },
        /* restore the search field content */
        "fnStateLoadCallback": function (oSettings, oData) {
            $("#search_text").val(oData.sFilter);
            if ('showUnavailable' in oData) {
                SHOW_UNAVAILABLE = oData.showUnavailable;
                updateButtons();
            }
            return true;
        }
    });

    /* trigger the search when pressing return in the text field */
    $("#search_form").submit(function(event) {
        event.preventDefault();
        table.fnFilter($("#search_text").val());
    });

    /* trigger the search when clicking the "search" button */
    $("#search_button").click(function() {
        table.fnFilter($("#search_text").val());
    });

    /* reset the search when clicking the "reset" button */
    $("#clear_search").click(function() {
        $("#search_text").val("");
        table.fnFilter("");
    });
    /* disable multi column sorting */
    $('#catalog_table thead th').click(function(event) {
        if (!$(event.target).hasClass('sorthandle')) {
            event.shiftKey = false;
        }
    });

    /* Button to select quatities values */
    $("#show_unavailable_button").click(function() {
        if (!SHOW_UNAVAILABLE) {
            SHOW_UNAVAILABLE = true;
            updateButtons();
            table.fnDraw();
        }
    });
    $("#hide_unavailable_button").click(function() {
        if (SHOW_UNAVAILABLE) {
            SHOW_UNAVAILABLE = false;
            updateButtons();
            table.fnDraw();
        }
    });

    $("#update_catalog_form").submit(function() {
        var checkboxes = $('#update_catalog_form input:checkbox');
        var available = "";
        var unavailable = "";
        for (var i=0 ; i < checkboxes.length ; i++) {
            if (checkboxes[i].checked) {
                available += "," + checkboxes[i].name;
            } else {
                unavailable += "," + checkboxes[i].name;
            }
        }
        if (available.length != 0) {
            available = available.substring(1);
        }
        if (unavailable.length != 0) {
            unavailable = unavailable.substring(1);
        }
        $('#update_catalog_form [name=available]').val(available);
        $('#update_catalog_form [name=unavailable]').val(unavailable);
    });

    updateButtons();
});


function updateButtons() {
    if (SHOW_UNAVAILABLE) {
        $("#show_unavailable_button").addClass('selected');
        $("#hide_unavailable_button").removeClass('selected');
    } else {
        $("#show_unavailable_button").removeClass('selected');
        $("#hide_unavailable_button").addClass('selected');
    }
}

