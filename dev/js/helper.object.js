function MyHelper() { }

/*  createMinSecDate function
    creates Date objects to calculate minutes/seconds 
    expects either:
    - String: two digits format '00:00'
    - Array: containing two elements with minutes and seconds [0, 30]
    Returns:
    Date Object with:
    - constant year, month, days, milliseconds
    - minutes and seconds according to input */
MyHelper.prototype.createMinSecDate = function(stringOrArray) {
  var minSecDate = new Date(2000, 1, 1, 0, 0, 0, 0);
  var mins;
  var secs;
  if (typeof stringOrArray === 'string') {
    mins = stringOrArray.substr(0, 2);
    secs = stringOrArray.substr(3, 2);
  }
  else {
    mins = stringOrArray[0];
    secs = stringOrArray[1];    
  }
  minSecDate.setMinutes(mins,secs, 0);
  return minSecDate;
}

/*  calcminSecAbsDiff function
    Calculates absolute difference in minutes and seconds
    Input:
    - Expects two strings in two digits format '00:00'
    Returns:
    - Two-element array containing [minutes, seconds] */
MyHelper.prototype.calcMinSecAbsDiff = function(string1, string2) {
  var date1 = this.createMinSecDate(string1);
  var date2 = this.createMinSecDate(string2);
  var diff = Math.abs(date1.getTime() - date2.getTime());
  var diffSecs = diff / 1000;
  var diffMins = Math.floor(diffSecs/60);
  diffSecs = diffSecs % 60;
  return [diffMins, diffSecs];
}