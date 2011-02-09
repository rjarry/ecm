const director_access_lvl = 999999999999;


// disable multi column sorting
$('#members_table thead th').click(function(event) {
    if (!$(event.target).hasClass('sorthandle')) {
        event.shiftKey = false;
    }
});

// dataTable setup
$(document).ready(function() {
	table = $('#members_table').dataTable( {
		"bProcessing": true,
		"bServerSide": true,
        "bAutoWidth": false,
        "iDisplayLength": 25,
        "bStateSave": true,
        "iCookieDuration": 60*60*24,
		"sAjaxSource": "/members/all_data",
        "sDom": 'lprtip',
        "aoColumns": [
            { "sTitle": "Name",         "sWidth": "25%", "sType": "html" },
            { "sTitle": "Nickname",     "sWidth": "20%", "sType": "string",       "bSortable": false     },
            { "sTitle": "Access Level", "sWidth": "10%", "sType": "access-level", "bSearchable": false   },
            { "sTitle": "Extra Roles",  "sWidth": "5%",  "sType": "numeric",      "bSearchable": false   },
            { "sTitle": "Corp Date",    "sWidth": "10%", "sType": "string",       "bSearchable": false   },
            { "sTitle": "Last Login",   "sWidth": "10%", "sType": "string",       "bSearchable": false   },
            { "sTitle": "Location",     "sWidth": "20%", "sType": "string",       "bSearchable": false   },
            { "sTitle": "Ship",         "sWidth": "5%",  "sType": "string" },
            { "bVisible": false },
        ],
        "fnRowCallback": function( nRow, aData, iDisplayIndex, iDisplayIndexFull ) {
            /* apply color to all access level cells */
            accessLvl = aData[2];
            if ( accessLvl == director_access_lvl ) {
				$('td:eq(2)', nRow).html( '<b>DIRECTOR</b>' );
            }
            $('td:eq(2)', nRow).addClass("row-" + getAccessColor(accessLvl));
            if (aData[3] > 0) {
                $('td:eq(3)', nRow).addClass("row-red");
            }
            /* set tooltip on each row */
            titles = aData[8]
            $(nRow).attr("title", titles)
            $('td:eq(8)', nRow).hide()
            return nRow;
		}
    } );

    $("#search_form").submit(function() {
        table.fnFilter($("#search_text").val());
        return false;
    });

    $("#search_button").click(function() {
        table.fnFilter($("#search_text").val());
    });

    $("#clear_search").click(function() {
        $("#search_text").val("");
        table.fnFilter("");
    });

} );

// utility function for getting color from access level
function getAccessColor(accessLvl) {
    for (var i=0 ; i < colorThresholds.length ; i++) {
        if (accessLvl <= colorThresholds[i]["threshold"]) {
            return colorThresholds[i]["color"];
        }
    }
    return colorThresholds[0]["color"]
}

