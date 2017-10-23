'use strict';

// Put your view code here (e.g., the graph renderering code)
/**
 *  TabView
 */
var TabView = function(model) {
    // Obtains itself
    var self = this;

    // Stores the model
    this.model = model;

    // Available tabs and divs
    this.nav_input_tab = document.getElementById('nav-input-tab');
    this.input_div = document.getElementById('input-div');

    this.nav_analysis_tab = document.getElementById('nav-analysis-tab');
    this.analysis_div = document.getElementById('analysis-div');

    // Binds tab view with model
    this.nav_input_tab.addEventListener('click', function() {
        model.selectTab('InputTab');
    });

    this.nav_analysis_tab.addEventListener('click', function() {
        model.selectTab('AnalysisTab');
    });

    // Binds model change with view
    this.model.addListener(function(eventType, eventTime, eventData) {
        if (eventType === TAB_SELECTED_EVENT)   {
            switch (eventData) {
                case 'InputTab':
                    self.nav_input_tab.className = "active";
                    self.nav_analysis_tab.className = "";
                    self.input_div.className = '';
                    self.analysis_div.className = 'hidden';
                    break;
                case 'AnalysisTab':
                    self.nav_analysis_tab.className = "active";
                    self.nav_input_tab.className = "";
                    self.input_div.className = 'hidden';
                    self.analysis_div.className = '';
                    break;
            }
        }
    });
};

/*
*   ActivityCollectionView
*/
var ActivityCollectionView = function(model){
    // Obtains itself
    var self = this;

    // Stores the model
    this.model = model;

    // keep track of the last entry
    this.lastEntry = null;

    // Get elements
    this.activity_select = document.getElementById('input-activity-select');
    this.input_energy_slider = document.getElementById('input-energy-slider');
    this.input_energy_value = document.getElementById('input-energy-value');
    this.input_stress_slider = document.getElementById('input-stress-slider');
    this.input_stress_value = document.getElementById('input-stress-value');
    this.input_happiness_slider = document.getElementById('input-happiness-slider');
    this.input_happiness_value = document.getElementById('input-happiness-value');
    this.input_time_txtbox = document.getElementById('input-time-txtbox');

    this.input_last_entry_value = document.getElementById('input-last-entry-value');
    this.input_add_btn = document.getElementById('input-add-btn');
    this.input_remove_btn = document.getElementById('input-remove-btn');
    this.input_remove_last_btn = document.getElementById('input-remove-last-btn');

    //helper fn
    var formatTime = function(time){
        var monthNames = ["January", "February", "March", "April", "May", "June",
                      "July", "August", "September", "October", "November", "December"];
        var day = time.getDate();
        var month = monthNames[time.getMonth()+1];
        var year = time.getFullYear();
        var hour = time.getHours();
        var minutes = time.getMinutes();
        var ampm = ((hour / 12) >= 1) ? "pm" : "am";
        var timeString = month + " " + day + ", " + year + " at " + (hour % 12) + ":" + minutes + " " + ampm;
        return timeString;
    };

    var resetForm = function(){
        self.activity_select.value = "Writing Code";
        self.input_energy_slider.value = 3;
        self.input_energy_value.innerHTML = 3;
        self.input_stress_slider.value = 3;
        self.input_stress_value.innerHTML = 3;
        self.input_happiness_slider.value = 3;
        self.input_happiness_value.innerHTML = 3;
        self.input_time_txtbox.value = 0;
    }

    //add event lisenter for the buttons
    this.input_add_btn.addEventListener('click',function(){
        //get input values
        var activityType = self.activity_select.value;
        var healthMetricsDict = {};
        healthMetricsDict["energyLevel"] = Number(self.input_energy_slider.value);
        healthMetricsDict["stressLevel"] = Number(self.input_stress_slider.value);
        healthMetricsDict["happinessLevel"] = Number(self.input_happiness_slider.value);
        var activityDurationInMinutes = self.input_time_txtbox.value;

        //validate input
        if(/^\d+$/.test(activityDurationInMinutes)){
            var newDataPoint = new ActivityData(activityType, healthMetricsDict, Number(activityDurationInMinutes));
            model.addBtnClicked(newDataPoint);

            self.lastEntry = newDataPoint;
            var curTime = new Date();
            self.input_last_entry_value.innerHTML = formatTime(curTime);
            resetForm();
        }
        else{
            alert("Please enter an intager for time spent!");
        }
    });

    this.input_remove_btn.addEventListener('click',function(){
        var activityType = self.activity_select.value;
        var healthMetricsDict = {};
        healthMetricsDict["energyLevel"] = Number(self.input_energy_slider.value);
        healthMetricsDict["stressLevel"] = Number(self.input_stress_slider.value);
        healthMetricsDict["happinessLevel"] = Number(self.input_happiness_slider.value);
        var activityDurationInMinutes = self.input_time_txtbox.value;

        //validate input
        if(/^\d+$/.test(activityDurationInMinutes)){
            var newDataPoint = new ActivityData(activityType, healthMetricsDict, Number(activityDurationInMinutes));
            model.removeBtnClicked(newDataPoint);
            resetForm();
        }
        else{
            alert("Please enter an intager for time spent!");
        }
    });

    this.input_remove_last_btn.addEventListener('click',function(){
        if (self.lastEntry){
            model.removeLastBtnClicked(self.lastEntry);
            resetForm();
        }
        else{
            alert("There are no previous entries");
        }

    });

    // Binds model change with view
    this.model.addListener(function(eventType, eventTime, activityData){
        if (eventType === ACTIVITY_DATA_ADDED_EVENT){
            model.addActivityDataPoint(activityData);
        }
        else if (eventType === ACTIVITY_DATA_REMOVED_EVENT){
            model.removeActivityDataPoint(activityData);
        }
    });
};

/*
*   GraphView
*/
var GraphView = function(graphModel,dataModel,tabModel){
    // Obtains itself
    var self = this;

    // Stores the model
    this.model = graphModel;

    // Get elements
    this.analysis_div = document.getElementById('analysis-div');
    this.analysis_display_container = document.getElementById('analysis-display-container');
    this.analysis_table = document.getElementById('analysis-table');
    this.analysis_canvas = document.getElementById('analysis-canvas');
    this.analysis_radio_buttons = document.getElementById('analysis-menu').getElementsByTagName('input');
    this.analysis_radio_buttons_TS = this.analysis_radio_buttons[0];

    // get data
    this.dataPoints = generateFakeData(dataModel,10);
    this.dataPoints = dataModel.getActivityDataPoints();

    // add event listener for menu
    var len = this.analysis_radio_buttons.length;
    for (var i = 0; i < len; i++){
        var rad = this.analysis_radio_buttons[i];
        rad.addEventListener('click',function(eventData){
            self.model.selectGraph(eventData.currentTarget.value);
        });
    }

    //helpers
    var populateTable = function(){
        var dps = self.dataPoints;
        var totalTime = {};

        var len = dps.length;
        for (var i = 0; i < len; i++){
            if (totalTime[dps[i].activityType]){
                totalTime[dps[i].activityType] += dps[i].activityDurationInMinutes;
            }
            else{
                totalTime[dps[i].activityType] = dps[i].activityDurationInMinutes;
            }
        }

        var tableContent = "<tr id=\"analysis-table-titles\"><td>Activities You Are Tracking</td><td>Time Spent (mins)</td></tr>";

        var activityType;
        for (activityType in totalTime){
            if (activityType) {
                tableContent += "<tr><td>" + activityType + "</td><td>" + totalTime[activityType] + "</td></tr>";
            }
        }
        self.analysis_table.innerHTML = tableContent;
    };

    var generateBarGraph = function(){
        var canvas = self.analysis_canvas;
        //get and analyze data
        var dps = self.dataPoints;
        var totalHealthMetrics = {};
        var totalEntries = {};
        var avgHealthMetrics = {};

        var len = dps.length;
        for (var i = 0; i < len; i++){
            var dp = dps[i];
            var type = dp.activityType;
            if (totalEntries[type]){
                totalEntries[type]++;
                totalHealthMetrics[type]["energyLevel"] += dp.activityDataDict["energyLevel"];
                totalHealthMetrics[type]["stressLevel"] += dp.activityDataDict["stressLevel"];
                totalHealthMetrics[type]["happinessLevel"] += dp.activityDataDict["happinessLevel"];
            }
            else{
                totalEntries[type] = 1;
                totalHealthMetrics[type] = {};
                totalHealthMetrics[type]["energyLevel"] = dp.activityDataDict["energyLevel"];
                totalHealthMetrics[type]["stressLevel"] = dp.activityDataDict["stressLevel"];
                totalHealthMetrics[type]["happinessLevel"] = dp.activityDataDict["happinessLevel"];
                avgHealthMetrics[type] = {};
                avgHealthMetrics[type]["energyLevel"] = 0;
                avgHealthMetrics[type]["stressLevel"] = 0;
                avgHealthMetrics[type]["happinessLevel"] = 0;
            }
        }

        var activityType;
        for (activityType in totalEntries){
            if (activityType) {
                avgHealthMetrics[activityType]["energyLevel"] = totalHealthMetrics[activityType]["energyLevel"] / totalEntries[activityType];
                avgHealthMetrics[activityType]["stressLevel"] = totalHealthMetrics[activityType]["stressLevel"] / totalEntries[activityType];
                avgHealthMetrics[activityType]["happinessLevel"] = totalHealthMetrics[activityType]["happinessLevel"] / totalEntries[activityType];
            }
        }

        var colours = ["#FF8E8E", "#FF2DFF", "#9191FF"];
        canvas.width = self.analysis_display_container.clientWidth - 50;
        canvas.height = canvas.width * 3/4 + 30;
        var centerX = canvas.width/2;
        var centerY = canvas.height/2 + 15;
        var maxBarHeight = canvas.height - 60;
        var barHeight = 0;
        var barWidth = canvas.width/25;
        var curX = barWidth * 3;
        var curY = 0;
        var yOffset = 30;
        var labelY = curX *1.2;
        var labelX = -maxBarHeight-28;


        //draw bars and labels
        var context = canvas.getContext("2d");
        context.clearRect(0, 0, canvas.width, canvas.height);
        context.save();
        context.textAlign = "center";
        context.fillStyle = "#000000";
        context.font = "bold " + Math.floor(canvas.height / 18) +"px Helvetica";
        context.fillText("Avg Health Metrics for Each Activities",centerX,16);

        context.beginPath();
        context.moveTo(barWidth * 2, 30);
        context.lineTo(barWidth * 2, maxBarHeight+31);
        context.lineTo(23 * barWidth, maxBarHeight+31);
        context.stroke();

        context.rotate(-1.57);
        context.font = "normal " + Math.floor(canvas.height / 27) +"px Helvetica";
        context.fillText("Level (1-5, the higher the better)",-canvas.height/2, barWidth*1.5);
        context.restore();
        var i = 0;
        for (activityType in totalEntries){
            if (activityType) {
                context.save();
                context.fillStyle = colours[0];
                barHeight = avgHealthMetrics[activityType]["energyLevel"] / 5 * maxBarHeight;
                curY = yOffset + maxBarHeight - barHeight;
                context.fillRect(curX, curY, barWidth, barHeight);
                curX += barWidth;
                context.restore();

                context.save();
                context.fillStyle = colours[1];
                barHeight = avgHealthMetrics[activityType]["stressLevel"] / 5 * maxBarHeight;
                curY = yOffset + maxBarHeight - barHeight;
                context.fillRect(curX, curY, barWidth, barHeight);
                curX += barWidth;
                context.restore();

                context.save();
                context.fillStyle = colours[2];
                barHeight = avgHealthMetrics[activityType]["happinessLevel"] / 5 * maxBarHeight;
                curY = yOffset + maxBarHeight - barHeight;
                context.fillRect(curX, curY, barWidth, barHeight);
                curX += barWidth * 2;
                context.restore();

                context.save();
                context.font = Math.floor(canvas.height / 35) +"px Helvetica";
                context.fillText(activityType, labelY-5, maxBarHeight+45);
                context.rotate(-1.57);
                context.fillText("Energy", labelX, labelY);
                labelY += barWidth;
                context.fillText("Stress", labelX, labelY);
                labelY += barWidth;
                context.fillText("Happiness", labelX, labelY);
                labelY += barWidth;
                context.restore();

                labelY += barWidth;
            }
        }
    };

    var generatePieChart = function(){
        var canvas = self.analysis_canvas;
        //get and analyze data
        var dps = self.dataPoints;
        var totalTime = {};
        var overallTotal = 0;

        var len = dps.length;
        for (var i = 0; i < len; i++){
            if (totalTime[dps[i].activityType]){
                totalTime[dps[i].activityType] += dps[i].activityDurationInMinutes;
            }
            else{
                totalTime[dps[i].activityType] = dps[i].activityDurationInMinutes;
            }
            overallTotal += dps[i].activityDurationInMinutes;
        }

        // calculate values that are needed to draw a pie chart
        var colours = ["#FF8E8E", "#FF2DFF", "#9191FF", "#67C7E2", "#A5D3CA", "#E994AB", "#CB59E8"];
        canvas.width = self.analysis_display_container.clientWidth - 50;
        canvas.height = canvas.width * 3/4 + 30;
        var centerX = canvas.width/2;
        var centerY = canvas.height/2 + 15;
        var r = canvas.height/2 - 15;

        var arcSizes = {};
        var sAngles = {}
        var sumSoFar = 0;
        var eAngles = {};
        var activityType;
        for (activityType in totalTime){
            if (activityType) {
                arcSizes[activityType] = (totalTime[activityType] / overallTotal * 360) * Math.PI / 180;
                sAngles[activityType] = sumSoFar;
                sumSoFar += arcSizes[activityType];
                eAngles[activityType] = sumSoFar;
            }
        }

        //draw slices and labels
        var context = canvas.getContext("2d");
        context.clearRect(0, 0, canvas.width, canvas.height);
        context.save();
        context.textAlign = "center";
        context.fillStyle = "#000000";
        context.font = "bold " + Math.floor(canvas.height / 18) +"px Helvetica";
        context.fillText("Total Time Spent on Each Activities",centerX,16);
        context.restore();
        var i = 0;
        for (activityType in totalTime){
            if (activityType) {
                context.save();
                context.beginPath();
                context.moveTo(centerX,centerY);
                context.arc(centerX,centerY,r,sAngles[activityType],eAngles[activityType],false);
                context.closePath();
                context.fillStyle = colours[i];
                context.fill();
                context.restore();

                context.save();
                context.translate(centerX,centerY);
                context.rotate(eAngles[activityType]);
                var x = centerX/4;
                var y = -5;
                context.font = Math.floor(canvas.height / 20) + "px Helvetica";
                context.fillStyle = "#000000";
                context.fillText(activityType, x, y);
                context.restore();
                i++;
            }
        }
    };

    // Binds model change with view
    this.model.addListener(function(eventType, eventTime, eventData){
        if (eventType === GRAPH_SELECTED_EVENT){
            switch (eventData) {
                case 'Table Summary':
                    self.analysis_table.className = '';
                    self.analysis_canvas.className = 'hidden';
                    populateTable();
                    break;
                case 'Bar Graph':
                    self.analysis_table.className = 'hidden';
                    self.analysis_canvas.className = '';
                    generateBarGraph();
                    break;
                case 'Pie Chart':
                    self.analysis_table.className = 'hidden';
                    self.analysis_canvas.className = '';
                    generatePieChart();
                    break;
            }
        }
    });

    window.addEventListener('resize', function(event){
        switch (self.model.getNameOfCurrentlySelectedGraph()) {
            case 'Bar Graph':
                generateBarGraph();
                break;
            case 'Pie Chart':
                generatePieChart();
                break;
        }
    });

    tabModel.addListener(function(eventType, eventTime, eventData){
        if (eventType === TAB_SELECTED_EVENT){
            self.model.selectGraph(null);
            self.analysis_radio_buttons_TS.checked = true;
            self.model.selectGraph(self.model.getAvailableGraphNames()[0]);

        }
    });

}
