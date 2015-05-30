function bmi(w, h)
{
  return Math.round((w / (h * h / 10000)));
}

exports.CurrentBodyMessIndex = function(ud)
{  
  var res = {};  
  res.date = ud[0].RecordTime;
  res.value = bmi(ud[0].Weight, ud[0].Height);

  return res;
}

exports.ListUserBodyMessIndes = function(ud, startDate, endDate)
{
  var res = {};
  res.date = [];
  res.value = [];
  
  for(var i = 0; i < ud.length; i++)
  {
    res.date[i] = ud[i].RecordTime;
    res.value[i] = bmi(ud[i].Weight, ud[i].Height);
  }  
  return res;
}


exports.AverageBodyMessIndes = function(ud, startDate, endDate, interval)
{
    //convert the date to milliseconds
    var TimeStart =  Date.parse(startDate);
    var TimeEnd =  Date.parse(endDate);
    var minutes = 1000 * 60;
    var duration = interval * minutes;

    var start = TimeStart;
    var res = {};
    res.date = [];
    res.avg = [];
    
    for(var num = 0; num < (TimeEnd - TimeStart)/duration; num++)
    {
        var sum = 0;
        var count = 0;
        var period = start + duration;

        for(var i = 0; i < ud.length; i++)
        {
            if(Date.parse(ud[i].RecordTime) < period)
            {
                sum += bmi(ud[i].Weight, ud[i].Height);
                count++;              
            }
        }

        if(count > 0)
        {
            res.date[num] = new Date(start);
            res.avg[num] = Math.round(sum / count);           
        }
        start = period;
    }
    return res;
}