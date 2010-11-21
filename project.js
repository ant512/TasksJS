var Projects = {

	/**
	 * Project object.
	 * @param name Name of the project.
	 * @startDate Start date of the project.
	 * @creator The creator of the project.
	 */
	Project: function(name, startDate, creator) {
		this.tasks = new Array();
		this.name = name;
		this.creator = creator;
		this.created = new Date();
		this.startDate = startDate;
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
	calc.recalculateDates(this.startDate);
}