var normal_lowest_hr = 60;
var normal_highest_hr = 100;

exports.CalHeartRate = function(data, values)
{
    var sum = 0;
    var res = "";
    var avg = 0;
    
    for(var i = 0; i < data.length; i++) {
        sum += data[i].Value;
    }
    if(values == "average") {
        avg = sum / data.length;
        if(avg >= 60 && avg <= 100)
            res = "Good";

        if(avg < 60 || avg > 100)
            res = "Be careful"; 
    }
    
    return avg;
}