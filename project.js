var Projects = {

	/**
	 * Project object.
	 * @param name Name of the project.
	 * @param startDate Start date of the project.
	 * @param week The project's working week.
	 * @param creator The creator of the project.
	 */
	Project: function(name, startDate, week, creator) {
		this.tasks = new Array();
		this.name = name;
		this.creator = creator;
		this.created = new Date();
		this.startDate = startDate;
		this.week = week;
	}
}

/**
 * Get the list of tasks.
 * @return An array containing the project's tasks.
 */
Projects.Project.prototype.getTasks = function() {
	return this.tasks;
}

/**
 * Add a new task to the project.
 * @param task The task to add.
 */
Projects.Project.prototype.addTask = function(task) {
	this.tasks.push(task);
}

/**
 * Recalculates the dates of all tasks in the project.
 */
Projects.Project.prototype.recalculateDates = function() {
	var calc = new Tasks.DateCalculator(this.tasks);
	calc.recalculateDates(this.tasks, this.startDate, this.week);
}