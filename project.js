var Projects = {

	Project: function(name, startDate, creator) {
		this.tasks = new Array();
		this.name = name;
		this.creator = creator;
		this.created = new Date();
		this.startDate = startDate;
	}
}

Projects.Project.prototype.getTasks = function() {
	return this.tasks;
}

Projects.Project.prototype.addTask = function(task) {
	this.tasks.push(task);
}

Projects.Project.prototype.recalculateDates = function() {
	var calc = new Tasks.DateCalculator(this.tasks);
	calc.recalculateDates(this.startDate);
}