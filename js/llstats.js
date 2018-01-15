var publicSpreadsheetUrl = 'https://docs.google.com/spreadsheets/d/1Di24NagrlrnISEgqANXngIqVPgLagZy11wJXW-fTr-w/pubhtml';

function init() {
    Tabletop.init( { key: publicSpreadsheetUrl,
        callback: showInfo,
        simpleSheet: true } )
}

function showInfo(data, tabletop) {
    // get a list of tabs and find the latest one (biggest number)
    var thisYear = tabletop.foundSheetNames[0];
    var thisYearsSheet = tabletop.sheets(thisYear);
    console.log(thisYearsSheet);

    var count = 0;
    var div = document.getElementById('data'),
        html = "<h1>" + thisYear + "</h1>",
        prop, i;

    html = html + "<table class='table table-bordered'><thead><tr>"

    var summaryStats = new Array();
    var excludes = new Array('x', 'Av. speed', 'Sprint - 1st', 'Sprint - 2nd', 'Sprint - 3rd', 'Route');
    function isInArray(value, array) {
        return array.indexOf(value) > -1;
    }
    // for each column add the riders name, distance and sprint points to a dictionary
    for(i = 0; i < thisYearsSheet.originalColumns.length; i++) {
        if(!isInArray(thisYearsSheet.columnNames[i], excludes)) {
            var dict = {};
            dict['name'] = thisYearsSheet.columnNames[i];
            dict['miles'] = parseFloat(thisYearsSheet.elements[0][thisYearsSheet.columnNames[i]]);
            dict['sprintPoints'] = parseFloat(thisYearsSheet.elements[1][thisYearsSheet.columnNames[i]]);
            
            var rides = 0;
            for(j = 2; j < thisYearsSheet.elements.length; j++) {
                if(parseFloat(thisYearsSheet.elements[j][thisYearsSheet.columnNames[i]])) {
                    rides = rides + 1;
                }
            }
            dict['numberOfRides'] = rides;
            dict['averageSprintPointsPerRide'] = parseInt(thisYearsSheet.elements[1][thisYearsSheet.columnNames[i]]) / rides;
            if(dict['miles'] != 0) {
                summaryStats.push(dict);
            }
        }
        html = html + "<th>" + thisYearsSheet.columnNames[i] + "</th>";
    }
    console.log(summaryStats);
    html = html + "</tr></thead><tbody class='table-striped'>";

    for(i = 0; i < thisYearsSheet.elements.length; i++) {
        html = html + "<tr>";
        for(prop in thisYearsSheet.elements[i]) {
            html = html + "<td>" + thisYearsSheet.elements[i][prop] + "</td>";
        }
        html = html + "</tr>";
    }
    html = html + "</tbody></table>"
    
    div.innerHTML = div.innerHTML + html;

    drawMilesChart(summaryStats);
    drawSprintPointsChart(summaryStats);
    drawSprintPointsPerRideChart(summaryStats);
}

function drawMilesChart(summaryStats) {
    var chart = c3.generate({
        bindto: '#milesChart',
        data: {
            json: 
                summaryStats
            ,
            keys: {
                x: 'name',
                value: ['miles']
            },
            names: {
                miles: 'Miles Ridden'
            },
            colors: {
                miles: '#156831'
            },                  
            type: 'bar',
            order: 'desc',
            labels: true
        },
        axis: {
            x: {
                type: 'category'
            },
            rotated: false
        }
    });
}

function drawSprintPointsChart(summaryStats) {
    var chart = c3.generate({
        bindto: '#sprintPointsChart',
        data: {
            json: 
                summaryStats
            ,
            line: {
                connectNull: true
            },            
            keys: {
                x: 'name',
                value: ['sprintPoints']
            },
            names: {
                sprintPoints: 'Sprint Points'
            },
            colors: {
                sprintPoints: '#156831'
            },
            type: 'bar',
            labels: true
        },
        axis: {
            x: {
                type: 'category'
            },
            rotated: false
        }
    });
}

function drawSprintPointsPerRideChart(summaryStats) {
    var chart = c3.generate({
        bindto: '#sprintPointsPerRideChart',
        data: {
            json: 
                summaryStats
            ,
            keys: {
                x: 'name',
                value: ['averageSprintPointsPerRide']
            },
            names: {
                averageSprintPointsPerRide: 'Average Sprint Points Per Ride'
            },
            colors: {
                averageSprintPointsPerRide: '#156831'
            },             
            type: 'bar',
            labels: true
        },
        axis: {
            x: {
                type: 'category'
            },
            rotated: false
        }
    });
}
