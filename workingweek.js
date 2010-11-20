var WorkingWeek = {

	/**
	 * Enum listing all days of the week.
	 */
	DayOfWeek: {
		Sunday: 0,
		Monday: 1,
		Tuesday: 2,
		Wednesday: 3,
		Thursday: 4,
		Friday: 5,
		Saturday: 6
	},
	
	/**
	 * TimeSpan class provides similar functionality to the TimeSpan class in
	 * C#.  Note that the functions offered by the TimeSpan class do not change
	 * the current instance; therefore, TimeSpan objects are considered
	 * to be immutable.
	 * @param days The number of days in the span.
	 * @param hours The number of hours in the span.
	 * @param minutes The number of minutes in the span.
	 * @param seconds The number of seconds in the span.
	 * @param milliseconds The number of milliseconds in the span.
	 */
	TimeSpan: function(days, hours, minutes, seconds, milliseconds) {
		this.milliseconds = milliseconds;
		this.milliseconds += seconds * 1000;
		this.milliseconds += minutes * 60 * 1000;
		this.milliseconds += hours * 60 * 60 * 1000;
		this.milliseconds += days * 24 * 60 * 60 * 1000;
	},

	/**
	 * Represents a single shift within a working day.
	 * @param startTime The start time of the shift.
	 * @param duration A TimeSpan representing the duration of the shift.
	 */
	Shift: function(startTime, duration) {
		this.startTime = startTime;
		this.duration = duration;
	},

	/**
	 * Represents a working day.
	 * @param dayOfWeek The day of the week represented by the object, which
	 * should be a value from the DayOfWeek enum.
	 */
	Day: function(dayOfWeek) {
		this.dayOfWeek = dayOfWeek;
		this.shifts = new Array();
		this.duration = new WorkingWeek.TimeSpan(0, 0, 0, 0, 0);
	},
	
	/**
	 * Represents a working week.
	 */
	Week: function() {
		this.duration = new WorkingWeek.TimeSpan(0, 0, 0, 0, 0);
		this.days = new Array();
		
		for (var i = 0; i < 7; ++i) {
			this.days[i] = new WorkingWeek.Day(i);
		}
	}
}



/** TimeSpan Methods **/

/**
 * Gets the total number of milliseconds in the time span.
 * @return The total number of milliseconds in the time span.
 */
WorkingWeek.TimeSpan.prototype.getTotalMilliseconds = function() {
	return this.milliseconds;
}

/**
 * Gets the number of days in the time span, excluding partial days.
 * @return The number of days in the time span, excluding partial days.
 */
WorkingWeek.TimeSpan.prototype.getDays = function() {
	return parseInt(this.getTotalDays());
}

/**
 * Gets the number of hours in the time span, excluding days or partial hours.
 * If the span had 2 days, 3 hours and 25 minutes, the function would return 3.
 * @return The number of hours in the time span, excluding days or partial
 * hours.
 */
WorkingWeek.TimeSpan.prototype.getHours = function() {
	return parseInt(this.getTotalHours() % 24);
}

/**
 * Gets the number of minutes in the time span, excluding days, minutes or
 * partial hours.  If the span had 3 hours, 25 minutes and 3 seconds, the
 * function would return 25.
 * @return The number  of minutes in the time span, excluding days, minutes or
 * partial hours.
 */
WorkingWeek.TimeSpan.prototype.getMinutes = function() {
	return parseInt(this.getTotalMinutes() % 60);
}

/**
 * Gets the number of seconds in the time span, excluding days, minutes, hours
 * or partial seconds.  If the time span had 25 minutes, 3 seconds and 10
 * milliseconds, the function would return 3.
 * @return The number of seconds in the time span, excluding days, minutes,
 * hours or partial seconds.
 */
WorkingWeek.TimeSpan.prototype.getSeconds = function() {
	return parseInt(this.getTotalSeconds() % 60);
}

/**
 * Gets the number of milliseconds in the time span, excluding days, minutes,
 * hours and seconds.  If the time span had 25 minutes, 3 seconds and 10
 * milliseconds, the function would return 10.
 * @return The number of milliseconds in the time span, excluding days, minutes,
 * hours and seconds.
 */
WorkingWeek.TimeSpan.prototype.getMilliseconds = function() {
	return parseInt(this.milliseconds % 1000);
}

/**
 * Gets the total number of days in the time span, including partial days.
 * @return The total number of days in the time span, including partial days.
 */
WorkingWeek.TimeSpan.prototype.getTotalDays = function() {
	return this.milliseconds / (1000 * 60 * 60 * 24);
}

/**
 * Gets the total number of hours in the time span, including partial hours.
 * @return The total number of hours in the time span, including partial hours.
 */
WorkingWeek.TimeSpan.prototype.getTotalHours = function() {
	return this.milliseconds / (1000 * 60 * 60);
}

/**
 * Gets the total number of minutes in the time span, including partial minutes.
 * @return The total number of minutes in the time span, including partial
 * minutes.
 */
WorkingWeek.TimeSpan.prototype.getTotalMinutes = function() {
	return this.milliseconds / (1000 * 60);
}

/**
 * Gets the total number of seconds in the time span, including partial seconds.
 * @return The total number of seconds in the time span, including partial
 * seconds.
 */
WorkingWeek.TimeSpan.prototype.getTotalSeconds = function() {
	return this.milliseconds / 1000;
}

/**
 * Gets a new TimeSpan object that contains the sum of the current time span
 * and the span supplied as an argument.
 * @param span The time span object to add to this.
 * @return A TimeSpan object that represents the sum of the current object and
 * the argument.
 */
WorkingWeek.TimeSpan.prototype.addTimeSpan = function(span) {
	return new WorkingWeek.TimeSpan(0, 0, 0, 0, this.milliseconds + span.getTotalMilliseconds());
}

/**
 * Gets a new TimeSpan object that contains the value of the current time span
 * minus the span supplied as an argument.
 * @param span The time span object to subtract from this.
 * @return A TimeSpan object that represents the value of the current object
 * minus the argument.
 */
WorkingWeek.TimeSpan.prototype.subtractTimeSpan = function(span) {
	return new WorkingWeek.TimeSpan(0, 0, 0, 0, this.milliseconds - span.getTotalMilliseconds());
}

/**
 * Compares the current TimeSpan and the supplied span object based on their
 * duration.
 * @return 1 if the current object is greater than the argument, -1 if the
 * opposite is true, or 0 if the objects have the same duration.
 */
WorkingWeek.TimeSpan.prototype.compareTo = function(span) {
	if (this.milliseconds > span.getTotalMilliseconds()) return 1;
	if (this.milliseconds < span.getTotalMilliseconds()) return -1;
	return 0;
}

/**
 * Returns a new TimeSpan object that contains a negated copy of the current
 * span.
 * @return A negated copy of the current object.
 */
WorkingWeek.TimeSpan.prototype.negate = function() {
	return new WorkingWeek.TimeSpan(0, 0, 0, 0, -this.milliseconds);
}


/** Shift Methods **/

/**
 * Gets the start time of the shift.
 * @return The start time of the shift, as a Date object.
 */
WorkingWeek.Shift.prototype.getStartTime = function() {
	return this.startTime;
}

/**
 * Gets the duration of the shift.
 * @return The duration of the shift, as a TimeSpan object.
 */
WorkingWeek.Shift.prototype.getDuration = function() {
	return this.duration;
}

/**
 * Gets the end time of the shift.
 * @return The end time of the shift, as a Date object.
 */
WorkingWeek.Shift.prototype.getEndTime = function() {
	return new Date(this.startTime.getTime() + this.duration.getTotalMilliseconds());
}

/**
 * Compares one shift with another.
 * @return -1 if the current shift comes before the supplied shift, 1 if the
 * current shift comes after the supplied shift, or 0 if the shifts are the
 * same.
 */
WorkingWeek.Shift.prototype.compareTo = function(shift) {
	if (this.startTime > shift.getStartTime()) return 1;
	if (this.startTime < shift.getStartTime()) return -1;
	
	return this.duration.compareTo(shift.getDuration());
}
	


/** Day Methods **/

/**
 * Check if the day is a working day (ie. it contains shifts).
 * @return A boolean indicating whether or not the day is working.
 */
WorkingWeek.Day.prototype.isWorking = function() {
	return this.shifts.length > 0;
}

/**
 * Gets the total duration of the day, in terms of working time.
 * @return The total working duration of the day as a TimeSpan object.
 */
WorkingWeek.Day.prototype.getDuration = function() {
	return this.duration;
}

/**
 * Finds a shift that intersects the supplied date.
 * @param date The date to search for.
 * @return  A shift object that contains the supplied date.  If no match is
 * found, the function returns null.
 */
WorkingWeek.Day.prototype.findShift = function(date) {
	
	// Ensure the search time uses the minimum available date
	var searchTime = new Date(1970, 0, 1, date.getHours(), date.getMinutes(), date.getSeconds(), date.getMilliseconds());
	
	for (i in this.shifts) {
		if ((searchTime >= this.shifts[i].getStartTime()) && (searchTime < this.shifts[i].getEndTime())) return this.shifts[i];
	}
	
	return null;
}

/**
 * Check if the supplied time is a working time.
 * @param date The date to check.
 * @return A boolean indicating whether or not the date is a working time.
 */
WorkingWeek.Day.prototype.isWorkingTime = function(date) {
	return (this.findShift(date) != null);
}

/**
 * Adds the supplied shift to the day.  Note that days cannot contain
 * overlapping shifts, and the function will throw an exception if this is
 * attempted.
 * @param shift The shift to add.  Note that the start *date* of the shift must
 * be set to 1/1/1970.  The start *time* can be whatever you need it to be.
 */
WorkingWeek.Day.prototype.addShift = function(shift) {
	if (this.isWorkingTime(shift.getStartTime())) throw("New shift conflicts with existing shift.");
	
	// Ensure shifts are inserted in sorted order
	var inserted = false;
	
	for (var i = 0; i < this.shifts.length; ++i) {
		if (shift.compareTo(this.shifts[i]) < 0) {
			this.shifts.push(shift);
			inserted = true;
			break;
		}
	}
	
	if (!inserted) {
		this.shifts = this.shifts.concat(shift);
	}
	
	this.duration = this.duration.addTimeSpan(shift.getDuration());
}

/**
 * Removes a shift from the day that has the same start time as the supplied
 * shift.  Duration is not considered as the day cannot contain two shifts that
 * overlap (ie. start at the same time).
 * @param shift A shift object that starts at the same time as the shift to
 * remove.
 */
WorkingWeek.Day.prototype.removeShift = function(shift) {
	var startTime = null;
	
	for (var i = 0; i < this.shifts.length; ++i) {
		var currentShift = this.shifts[i];
		startTime = currentShift.getStartTime();
		
		if ((startTime.getHours() == hour) &&
			(startTime.getMinutes() == minute) &&
			(startTime.getSeconds() == second) &&
			(startTime.getMilliseconds() == millisecond)) {
			
			// Remove the shift's duration along with the shift itself
			this.duration = this.duration.subtractTimeSpan(currentShift.getDuration());
			this.shifts.splice(i, 1);
			break;
		}
	}
}

/**
 * Get the next shift after the supplied date.  If the next appropriate shift
 * contains the supplied date, that shift is returned.
 * @param date Date of the shift to find.
 * @return The appropriate shift, or null if no shift is found.
 */
WorkingWeek.Day.prototype.getNextShift = function(date) {

	// Ensure that the supplied date matches this day of the week
	if (date.getDay() != this.dayOfWeek) throw("Supplied date contains the wrong day of the week.");
	
	// Adjust the date to search for so that it consists only of the time; the date is not relevant
	var searchTime = new Date(1970, 0, 1, date.getHours(), date.getMinutes(), date.getSeconds(), date.getMilliseconds());
	
	for (i in this.shifts) {
		
		// Does the shift contain the date?
		if (searchTime < this.shifts[i].getEndTime()) {
		
			// If the shift starts after the date, return the entire shift
			if (searchTime <= this.shifts[i].getStartTime()) return this.shifts[i];
			
			// The date occurs somewhere within the shift, so adjust the shift so that it starts at the date and return that
			var milliseconds = this.shifts[i].getDuration().getTotalMilliseconds();
			milliseconds -= (searchTime.getTime() - this.shifts[i].getStartTime().getTime());
			
			var duration = new WorkingWeek.TimeSpan(0, 0, 0, 0, milliseconds);
			
			return new WorkingWeek.Shift(searchTime, duration);
		}
	}
	
	return null;
}

/**
 * Get the shift prior to the supplied date.  If the next appropriate shift
 * contains the supplied date, that shift is returned.
 * @param date Date of the shift to find.
 * @return The appropriate shift, or null if no shift is found.
 */
WorkingWeek.Day.prototype.getPreviousShift = function(date) {

	// Ensure that the supplied date matches this day of the week
	if (date.getDay() != this.dayOfWeek) throw("Supplied date contains the wrong day of the week.");
	
	// Adjust the date to search for so that it consists only of the time; the date is not relevant
	var searchTime = new Date(1970, 0, 1, date.getHours(), date.getMinutes(), date.getSeconds(), date.getMilliseconds());
	
	for (var i = this.shifts.length - 1; i >= 0; --i) {
	
		var shift = this.shifts[i];
		
		// Does the shift contain the date?
		if (searchTime > shift.getStartTime()) {
		
			// If the shift ends after the date, return the entire shift
			if (searchTime >= shift.getEndTime()) return shift;
			
			// The date occurs somewhere within the shift, so adjust the shift
			var milliseconds = searchTime.getTime() - shift.getStartTime().getTime();
			
			var duration = new WorkingWeek.TimeSpan(0, 0, 0, 0, milliseconds);
			
			return new WorkingWeek.Shift(searchTime, duration);
		}
	}
	
	return null;
}



/** Week Methods **/

/**
 * Gets the duration of the week in terms of working shifts.
 * @return The duration of the week as a TimeSpan object.
 */
WorkingWeek.Week.prototype.getDuration = function() {
	var duration = new WorkingWeek.TimeSpan(0, 0, 0, 0, 0);
	
	for (i in this.days) {
		duration = duration.addTimeSpan(this.days[i].getDuration());
	}
	
	return duration;
}

/**
 * Check if the week contains any shifts.
 * @return A boolean indicating whether or not the week contains shifts.
 */
WorkingWeek.Week.prototype.containsShifts = function() {
	for (i in this.days) {
		if (this.days[i].isWorking()) return true;
	}
	
	return false;
}

/**
 * Get the day object for the given day of the week.
 * @param dayOfWeek A value indicating the day of the week (this can be an
 * integer between 0 and 6, but using the WorkingWeek.DayOfWeek enum is
 * recommended).
 * @return The relevant day object.
 */
WorkingWeek.Week.prototype.getDay = function(dayOfWeek) {
	return this.days[dayOfWeek];
}

/**
 * Add a shift to the week.  The arguments specify the start and duration of the
 * shift.
 * @param dayOfWeek A value indicating the day of the week (this can be an
 * integer between 0 and 6, but using the WorkingWeek.DayOfWeek enum is
 * recommended).
 * @param hour The start hour of the shift.
 * @param minute The start minute of the shift.
 * @param second The start second of the shift.
 * @param millisecond The start millisecond of the shift.
 * @param duration The length of the shift.  This must be a TimeSpan object.
 */
WorkingWeek.Week.prototype.addShift = function(dayOfWeek, hour, minute, second, millisecond, duration) {
	this.getDay(dayOfWeek).addShift(new WorkingWeek.Shift(new Date(1970, 0, 1, hour, minute, second, millisecond), duration));
}

/**
 * Remove a shift from the week.  The supplied arguments must match the start of
 * the shift exactly.  The function does not attempt to find a shift that
 * *contains* the specified time; it will only match shifts that *start* at the
 * specified time.
 * @param dayOfWeek A value indicating the day of the week (this can be an
 * integer between 0 and 6, but using the WorkingWeek.DayOfWeek enum is
 * recommended).
 * @param hour The start hour of the shift.
 * @param minute The start minute of the shift.
 * @param second The start second of the shift.
 * @param millisecond The start millisecond of the shift.
 */
WorkingWeek.Week.prototype.removeShift = function(dayOfWeek, hour, minute, second, millisecond) {
	this.getDay(dayOfWeek).removeShift(new WorkingWeek.Shift(new Date(1970, 0, 1, hour, minute, second, millisecond)));
}

/**
 * Check if the specified date is a working date (ie. it contains shifts).
 * @param date The date to check.
 * @return A boolean indicating whether or not the date is a working date.
 */
WorkingWeek.Week.prototype.isWorkingDate = function(date) {
	var workingDay = this.getDay(date.getDay());
	
	if (!workingDay) return false;
	
	if (!workingDay.isWorking()) return false;
	
	return workingDay.isWorkingTime(date);
}

/**
 * Check if the specified day of the week is a working day (ie. it contains
 * shifts).
 * @param dayOfWeek A value indicating the day of the week (this can be an
 * integer between 0 and 6, but using the WorkingWeek.DayOfWeek enum is
 * recommended).
 * @return A boolean indicating whether or not the day is a working day.
 */
WorkingWeek.Week.prototype.isWorkingDay = function(dayOfWeek) {
	return this.getDay(dayOfWeek).isWorking();
}

/**
 * Locates the first shift that occurs after the supplied date.  If the date
 * falls within a shift, that shift is returned (but truncated, so that its
 * start date matches the supplied date).
 * @param date The date at which searching will begin.
 * @return The first shift after to the supplied date.  If no shift is found,
 * the function returns null.
 */
WorkingWeek.Week.prototype.getNextShift = function(date) {
	if (!this.containsShifts()) return null;
	
	for (var i = 0; i < 7; ++i) {
		var day = this.days[date.getDay()];
		
		if (day.isWorking()) {
		
			var shift = day.getNextShift(date);
		
			if (shift != null) {
				var shiftTime = shift.getStartTime();
				var adjustedTime = new Date(date.getFullYear(), date.getMonth(), date.getDate(), shiftTime.getHours(), shiftTime.getMinutes(), shiftTime.getSeconds(), shiftTime.getMilliseconds());
			
				var adjustedShift = new WorkingWeek.Shift(adjustedTime, shift.getDuration());
				return adjustedShift;
			}
		}
		
		// Move to the next day
		date = new Date(date.getTime() + (24 * 60 * 60 * 1000));
		date.setHours(0);
		date.setMinutes(0);
		date.setSeconds(0);
		date.setMilliseconds(0);
	}
	
	// No shifts match - this should never happen if the week passes the
	// containsShifts() check.
	return null;
}

/**
 * Locates the first shift that occurs prior to the supplied date.  If the date
 * falls within a shift, that shift is returned (but truncated, so that its end
 * date matches the supplied date).
 * @param date The date at which searching will begin.
 * @return The first shift prior to the supplied date.  If no shift is found,
 * the function returns null.
 */
WorkingWeek.Week.prototype.getPreviousShift = function(date) {
	if (!this.containsShifts()) return null;
	
	for (var i = 0; i < 7; ++i) {
		var day = this.days[date.getDay()];
		
		if (day.isWorking()) {
			var shift = day.getPreviousShift(date);
			
			if (shift != null) {
				var shiftTime = shift.getStartTime();
				var adjustedTime = new Date(date.getFullYear(), date.getMonth(), date.getDate(), shiftTime.getHours(), shiftTime.getMinutes(), shiftTime.getSeconds(), shiftTime.getMilliseconds());
			
				var adjustedShift = new WorkingWeek.Shift(adjustedTime, shift.getDuration());
				return adjustedShift;
			}
		}
		
		// Move to the previous day
		date.setHours(0);
		date.setMinutes(0);
		date.setSeconds(0);
		date.setMilliseconds(0);
		
		date = new Date(date.getTime() - 1);
	}
	
	// No shifts match - this should never happen if the week passes the
	// containsShifts() check.
	return null;
}

/**
 * Gets the difference between the two dates in terms of the working time.  If
 * Bob works 2 hours on 10/10/2011 at 9:00, and doesn't work at all on
 * 11/10/2011, then the date diff between 10/10/2011 at 7:00 and 11/10/2011 at
 * 16:30 is 2 *working* hours.
 * @param startDate The start date.
 * @param endDate The end date.
 * @return The working time difference between the two dates as a TimeSpan
 * object.
 */
WorkingWeek.Week.prototype.dateDiff = function(startDate, endDate) {
	var invertedDates = null;
	
	// Invert dates if necessary so that startDate always precedes endDate
	if (startDate > endDate) {
		var swap = startDate;
		startDate = endDate;
		endDate = swap;

		invertedDates = true;
	}
	
	var timeDiff = endDate.getTime() - startDate.getTime();
	var workDiff = 0;

	// Calculate how many weeks difference there are between the two dates, then
	// calculate how much work time that represents, and add it to the workDiff.
	var millisecondsPerWeek = 7 * 24 * 60 * 60 * 1000;
	var weeks = parseInt(timeDiff / millisecondsPerWeek);

	if (weeks > 0) {
		// Remember the amount of working time for these whole weeks
		workDiff += weeks * this.getDuration().getTotalMilliseconds();
		
		// Adjust the start date so that the time already allocated is not
		// considered again
		startDate = new Date(startDate.getTime() + (weeks * millisecondsPerWeek));
	}

	// Allocate remaining fraction of a week
	while (startDate < endDate) {
		var shift = this.getNextShift(startDate);
		
		// Stop if the shift falls outside the bounds we're interested in
		if (shift.getStartTime() >= endDate) break;
		
		// Remember the working duration
		workDiff += shift.getDuration().getTotalMilliseconds();
		
		// Move the start date up
		startDate = shift.getEndTime();
		
		// Account for the situation in which we over-allocate time (ie. end
		// date falls within a shift)
		if (startDate > endDate) {
			workDiff -= (startDate.getTime() - endDate.getTime());
		}
	}

	// Return inverted timespan if we swapped the dates
	if (!invertedDates)	{
		return new WorkingWeek.TimeSpan(0, 0, 0, 0, workDiff);
	} else {
		return new WorkingWeek.TimeSpan(0, 0, 0, 0, -workDiff);
	}
}

/**
 * Gets the end date of a working period that begins at startDate and lasts for
 * the specified duration.  Duration must be a TimeSpan object and must
 * represent a positive period.  Externally, dateAdd() should really be used
 * instead.
 * @param startDate Date at which the period begins.
 * @param duration The length of the period.
 * @return The date at which the period will end, based on the working week.
 */
WorkingWeek.Week.prototype.dateAddPositive = function(startDate, duration) {
	var endDate = startDate;
	
	// Calculate how many weeks we can allocate simultaneously to avoid
	// iterating over days
	var millisecondsPerWeek = 7 * 24 * 60 * 60 * 1000;
	var weeks = parseInt(this.getDuration() / millisecondsPerWeek);
	
	if (weeks > 0) {
		duration = new WorkingWeek.TimeSpan(0, 0, 0, 0, duration.getTotalMilliseconds() - (weeks * millisecondsPerWeek));
		endDate = new Date(endDate.getTime() + (weeks * millisecondsPerWeek));
	}
	
	// Allocate remaining fraction of a week
	while (duration.getTotalMilliseconds() > 0) {
		var shift = this.getNextShift(endDate);
		
		
		if (duration.getTotalMilliseconds() > shift.getDuration().getTotalMilliseconds()) {
		
			// Move the end date to the end of the shift, and subtract the length of the
			// shift from the remaining duration
			endDate = shift.getEndTime();
			duration = duration.subtractTimeSpan(shift.getDuration());
		} else {
		
			// Remaining duration is shorter than the shift
			endDate = new Date(shift.getStartTime().getTime() + duration.getTotalMilliseconds());
			duration = new WorkingWeek.TimeSpan(0, 0, 0, 0, 0);
		}
	}
	
	return endDate;
}

/**
 * Gets the end date of a working period that begins at startDate and lasts for
 * the specified duration.  Duration must be a TimeSpan object and must
 * represent a negative period.  Externally, dateAdd() should really be used
 * instead.
 * @param startDate Date at which the period begins.
 * @param duration The length of the period.
 * @return The date at which the period will end, based on the working week.
 */
WorkingWeek.Week.prototype.dateAddNegative = function(startDate, duration) {
	var endDate = startDate;
	
	// Invert duration so that comparisons are more logical
	duration = duration.negate();
	
	// Calculate how many weeks we can allocate simultaneously to avoid
	// iterating over days
	var millisecondsPerWeek = 7 * 24 * 60 * 60 * 1000;
	var weeks = parseInt(this.getDuration() / millisecondsPerWeek);
	
	if (weeks > 0) {
		duration = new WorkingWeek.TimeSpan(0, 0, 0, 0, duration.getTotalMilliseconds() - (weeks * millisecondsPerWeek));
		endDate = new Date(endDate.getTime() - (weeks * millisecondsPerWeek));
	}
	
	// Allocate remaining fraction of a week
	while (duration.getTotalMilliseconds() > 0) {
		var shift = this.getPreviousShift(endDate);
		
		if (duration.getTotalMilliseconds() > shift.getDuration().getTotalMilliseconds()) {
		
			// Move the end date to the start of the shift, and subtract the length of the
			// shift from the remaining duration
			endDate = shift.getStartTime();
			duration = duration.subtractTimeSpan(shift.getDuration());
		} else {
		
			// Remaining duration is shorter than the shift
			endDate = new Date(shift.getEndTime().getTime() - duration.getTotalMilliseconds());
			duration = new WorkingWeek.TimeSpan(0, 0, 0, 0, 0);
		}
	}
	
	return endDate;
}

/**
 * Gets the end date of a working period that begins at startDate and lasts for
 * the specified duration.  Duration must be a TimeSpan object, but can
 * represent either a positive or negative period.
 * @param startDate Date at which the period begins.
 * @param duration The length of the period.
 * @return The date at which the period will end, based on the working week.
 */
WorkingWeek.Week.prototype.dateAdd = function(startDate, duration) {
	if (duration.getTotalMilliseconds() > 0) {
		return this.dateAddPositive(startDate, duration);
	} else if (duration.getTotalMilliseconds() < 0) {
		return this.dateAddNegative(startDate, duration);
	}

	return startDate;
}