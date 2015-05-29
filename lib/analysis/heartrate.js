exports.CalHeartRate = function(ud, interval)
{
    var sec = Math.round(interval * 60);
    var res = {};
    res.date = [];
    res.avg = [];
    var sum = 0;
    var count = 0;
    var zero = 0;
    for(var i = 0; i < ud.length; i++)
    {
        if(ud[i].Value == 0)
               zero++;
        sum += ud[i].Value;
        if(i / sec == 1+count) {
            res.date[count] = ud[i].RecordTime;
            res.avg[count] = Math.round(sum / (sec-zero));        
            count++;
            sum = 0;
            zero = 0;
        }
    }
    return res;
};