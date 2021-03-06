var publicSpreadsheetUrl = 'https://docs.google.com/spreadsheets/d/1Di24NagrlrnISEgqANXngIqVPgLagZy11wJXW-fTr-w/pubhtml';

function init() {
    console.log("init");
    Tabletop.init( { key: publicSpreadsheetUrl,
        callback: showInfo,
        simpleSheet: true } )
}

function isInArray(value, array) {
    return array.indexOf(value) > -1;
}

function showInfo(data, tabletop) {
    // get a list of tabs and find the latest one (biggest number)
    var thisYear = tabletop.foundSheetNames[0];
    var thisYearsSheet = tabletop.sheets(thisYear);
    var count = 0;
    var summaryStats = new Array();
    var excludes = new Array('x', 'Av. speed', 'Sprint - 1st', 'Sprint - 2nd', 'Sprint - 3rd', 'Route');

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
    }
    console.log(summaryStats);
    updateTotalMiles(summaryStats);

    drawMilesChart(summaryStats);
    filterZeros(summaryStats);
    drawSprintPointsChart(summaryStats);
    console.log(summaryStats);
    console.log(summaryStats.length);
    drawSprintPointsPerRideChart(summaryStats);

    // call the page functions
    startPage();
    // data loaded, hide the loader
    document.getElementById('loader_wrapper').style.display = 'none';
}

function remove(array, element) {
    const index = array.indexOf(element);
    if (index !== -1) {
        array.splice(index, 1);
    }
}

function filterZeros(summaryStats) {
    for(i=0;i<summaryStats.length;i++)
    {
        if(summaryStats[i].sprintPoints === 0) {
            //console.log(summaryStats[i]);
            remove(summaryStats, summaryStats[i]);
        } else {
            console.log(summaryStats[i]);
        }
    }
}

function updateTotalMiles(summaryStats) {
    var totalMiles = 0;
    sortByKey(summaryStats, 'miles');
    for(i=0; i<summaryStats.length; i++) {
        totalMiles = totalMiles + summaryStats[i].miles;
    }
    // update the top 6 for the homepage
    var nums = document.getElementById("miles");
    var listItem = $(".skills_row");
    var highestMilege = summaryStats[0].miles.toFixed(0);
    var lowestMilege = summaryStats[5].miles.toFixed(0);
    var range = highestMilege - lowestMilege;
    var increment = 0;
    var percentage = 0;

    for(j=0; j<6;j++) {
        increment = summaryStats[j].miles.toFixed(0)-lowestMilege;
        percentage = ((increment/range) * 100).toFixed('2');
        
        if(percentage==='0.00') {
            percentage='5.00';
        }
        //console.log(summaryStats[j].miles,percentage);
        $(listItem[j]).find(".value").html(summaryStats[j].miles.toFixed(0) + "<br />Miles");
        $(listItem[j]).find(".progress").attr('data-process', percentage + "%");
        $(listItem[j]).find(".caption").html(summaryStats[j].name);
    }
    document.getElementById('clubmiles').textContent = totalMiles.toFixed(0) + " miles";
}

function sortByKey(array, key) {
    return array.sort(function(a, b) {
        var x = a[key]; var y = b[key];
        return ((x > y) ? -1 : ((x < y) ? 1 : 0));
    });
}

function drawMilesChart(summaryStats) {
    var chart = c3.generate({
        bindto: '#milesChart',
        data: {
            json: 
                sortByKey(summaryStats, 'miles')
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
            rotated: true
        }
    });
}

function drawSprintPointsChart(summaryStats) {
    var chart = c3.generate({
        bindto: '#sprintPointsChart',
        data: {
            json: 
                sortByKey(summaryStats, 'sprintPoints')
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
            rotated: true
        }
    });
}

function drawSprintPointsPerRideChart(summaryStats) {
    var chart = c3.generate({
        bindto: '#sprintPointsPerRideChart',
        data: {
            json: 
            sortByKey(summaryStats, 'averageSprintPointsPerRide')
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
            rotated: true
        }
    });
}
