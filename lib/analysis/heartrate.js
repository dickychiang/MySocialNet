exports.CalHeartRate = function(ud, startDate, endDate, interval)
{
    //convert the date to milliseconds
    var TimeStart =  Date.parse(startDate);
    var TimeEnd =  Date.parse(endDate);
    var minutes = 1000 * 60;
    var duration = interval * minutes;

    var start = TimeStart;
    var res = [];
    
    var i = 0;
    for(var num = 0; num < (TimeEnd - TimeStart)/duration; num++)
    {
        var sum = 0;
        var count = 0;
        var period = start + duration;
/*
        for(var i = 0; i < ud.length; i++)
        {
            if(Date.parse(ud[i].RecordTime) < period)
            {
                sum += ud[i].Value;
                count++;              
            }
        }

        if(count > 0)
        {
            res.date[num] = new Date(start);
            res.avg[num] = Math.round(sum / count);           
        }
        start = period;
 */     
        while(i < ud.length && Date.parse(ud[i].RecordTime) < period){
            sum += ud[i].Value;
            count++;
            i++;
        }
        if(count > 0) {
            var avg = Math.round(sum/count);
            res.push({"date": new Date(start),"avg": avg});
        }
        start = period;
    }
    return res;
};