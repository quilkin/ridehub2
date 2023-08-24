function pad2(num : number) {
    var s = "00" + num;
    return s.substring(s.length - 2);
};

const TimesDates = {


    toIntDays: function (time : Date | undefined) {
        if (time === undefined) {
            console.log('Date error: undefined')
                return 0;
        }
        // return number of whole days since 01/01/1970
        var value = time.valueOf();
        value /= 86400000;
        return parseInt(value.toFixed(0));  
    },
    dateString: function (time : Date | undefined) {
        if (time === undefined) {
                return 'Unknown date';
        }
        // toLocaleTimeString() is no good for different platforms
        //return [time.getFullYear(), pad2(time.getMonth() + 1), pad2(time.getDate())].join('-');
        return time.toDateString();
    },
    fromIntTime: function (intTime : number) {
        // return time of day from minutes;
        var hours = Math.floor(intTime / 60);
        var mins = intTime % 60;
        return pad2(hours) + ':' +pad2(mins);
    },

}


export default TimesDates;
