var Tasks = {

	/**
	 * Task object.
	 * @param name Name of the task.
	 * @param duration The length of the task in milliseconds.
	 * @param orderNumber The order number of the task when it is displayed.
	 */
	Task: function(name, duration, orderNumber) {
		this.name = name;
		this.startDate = new Date();
		this.endDate = new Date();
		this.dependencies = new Array();
		this.duration = duration;
		this.orderNumber = orderNumber;
		this.parent = null;
		this.children = new Array();
	},
	
	/**
	 * Used to calculate the start dates of all tasks.
	 */
	DateCalculator: function() { },
	
	/**
	 * Owning task will start when the task it is dependent on finishes.
	 * @param dependentOn Task that this task is dependent on.
	 */
	FinishToStartDependency: function(dependentOn) {
		this.owner = null;
		this.dependentOn = dependentOn;
	},
	
	/**
	 * Owning task will finish when the task it is dependent on finishes.
	 * @param dependentOn Task that this task is dependent on.
	 */
	FinishToFinishDependency: function(dependentOn) {
		this.owner = null;
		this.dependentOn = dependentOn;
	},
	
	/**
	 * Owning task will start when the task it is dependent on starts.
	 * @param dependentOn Task that this task is dependent on.
	 */
	StartToStartDependency: function(dependentOn) {
		this.owner = null;
		this.dependentOn = dependentOn;
	},
	
	/**
	 * Owning task will finish when the task it is dependent on starts.
	 * @param dependentOn Task that this task is dependent on.
	 */
	StartToFinishDependency: function(dependentOn) {
		this.owner = null;
		this.dependentOn = dependentOn;
	},
	
	/**
	 * Owning task will start on the specified date.
	 * @param startDate Date on which the date will start.
	 */
	FixedStartDependency: function(startDate) {
		this.owner = null;
		this.dependentOn = null;
		this.startDate = startDate;
	}
}


/** DateCalculator Methods **/

/**
 * Get a flattened array of the tasks in the current tree array.  Each item in
 * the array in an anonymous object consisting of a task and an array of
 * dependencies.  Dependencies are represented solely by the task on which the
 * current task is dependent.  Phases (tasks with children) are not represented
 * in the array.  Dependencies on phases are replaced with dependencies on all
 * children within the phase.  For example, suppose we have this:
 *
 * +-----+
 * |  1  |---------+
 * +------         |
 *          +--------------------+
 *          |          2         |----+
 *            +-----+                 |
 *            |  3  |-------+         |
 *            +-----+       |         |
 *                       +------+     |
 *                       |  4   |     |
 *                       +------+     |
 *                                 +-----+
 *                                 |  5  |
 *                                 +-----+
 *
 * The resultant array looks like this:
 *   1
 *   3 (dependent on 1)
 *   4 (dependent on 3 and 1)
 *   5 (dependent on 3 and 4)
 *
 * We've basically substituted phase 2 with (task 3 and 4).  This means that
 * we don't run into a cyclic dependency issue.  In the diagram above, the start
 * of 3 is dependent on the start of 2.  However, if 3 had a dependency on
 * another task, then the start of 2 would also be dependent on the start of 3.
 * Cyclic dependency = impossible to resolve without some nasty, hacky
 * workarounds.
 * @param taskList the array/tree hybrid data structure that contains the
 * tasks to recalculate.
 * @return An array of task/dependencies.
 */
Tasks.DateCalculator.prototype.getFlatList = function(tasks) {
	var list = new Array();
	var stack = new Array();
	
	for (var i in tasks) {
		stack.push(tasks[i]);
	}
	
	while (stack.length > 0) {
		var task = stack.pop();
		
		if (task.getChildren().length > 0) {
		
			// Do not add phases to the list - only add their childen.  We
			// do not want to try and work with phases as they make the
			// calculations horrendous due to the need to introduce circular
			// dependencies, so instead we substitute a phase's children
			// for the phase itself
			for (var i = 0; i < task.getChildren().length; ++i) {
				stack.push(task.getChildren()[i]);
			}
		} else {
		
			// Get a list of all dependencies that this task has.  This list
			// will include its own dependencies and the dependencies of its
			// ancestors, as all of these affect the task
			var dependencies = task.getAllTaskDependencies();

			list.push({ task: task, dependencies: dependencies });
		}
	}

	return list;
}

/**
 * Gets a topologically sorted array of the task list.  Each task is ordered so
 * that the tasks that it depends on come before it in the list.  Therefore, the
 * first task(s) in the list will always be those tasks that are not dependent
 * on any other.
 * Unlike the getFlatList() function, this returns an array of plain task
 * objects.
 * @param taskList the array/tree hybrid data structure that contains the
 * tasks to recalculate.
 * @return An array of sorted task objects.
 */
Tasks.DateCalculator.prototype.getSortedList = function(tasks) {
	var rootTasks = new Array();
	var removedDependencyCounts = new Array();
	var sortedTasks = new Array();
	var unsortedTasks = this.getFlatList(tasks);
	
	// Create list of tasks that are not dependent on any other
	for (var i in unsortedTasks) {
		if (unsortedTasks[i].dependencies.length == 0) {
			rootTasks.push(unsortedTasks[i]);
		}
		
		removedDependencyCounts[i] = 0;
	}
	
	// Sort the graph
	while (rootTasks.length > 0) {
		
		// Remove the first task from the root list
		var task = rootTasks[0];
		rootTasks.splice(0, 1);
		
		// Add the task to the sorted list
		sortedTasks.push(task.task);
		
		// Loop through the tasks that are dependent on this, reducing their
		// counts and, for each task with no subsequent dependencies, adding it
		// to the sorted list
		for (var i in unsortedTasks) {
			var dependencies = unsortedTasks[i].dependencies;
			
			for (var j in dependencies) {
				if (dependencies[j] == task.task) {
					removedDependencyCounts[i]++;
					
					if (dependencies.length == removedDependencyCounts[i]) {
						rootTasks.push(unsortedTasks[i]);
					}
				}
			}
		}
	}
	
	return sortedTasks;
}

/**
 * Recalculates the start date of all tasks in the list.  Relies on the sort()
 * function to ensure that all tasks on which task T is dependent on are
 * calculated before T is reached.  Recalculating dates becomes a simple matter
 * of asking the task's dependencies for their start dates, and choosing the
 * latest date.
 * @param tasks the array/tree hybrid data structure that contains the
 * tasks to recalculate.
 * @param earliestDate The earliest date for any task.
 * @param week The working week to base date calculations on.
 */
Tasks.DateCalculator.prototype.recalculateDates = function(tasks, earliestDate, week) {
	
	// Ensure that the list is sorted topologically before we begin.  This means
	// that all tasks will have the correct start and end dates before any
	// dependent tasks have their dates calculated
	var list = this.getSortedList(tasks);
	
	// Recalculate the start date for all tasks in the list
	for (var i in list) {
		list[i].recalculateDates(earliestDate, week);
	}
}


/** Task Methods **/

Tasks.Task.prototype.getParent = function() {
	return this.parent;
}

Tasks.Task.prototype.setParent = function(task) {
	this.parent = task;
}

Tasks.Task.prototype.getChildren = function() {
	return this.children;
}

Tasks.Task.prototype.hasChildren = function() {
	return this.children.length > 0;
}

/**
 * Add a child task to the current task.
 * @param task The task to add.
 */
Tasks.Task.prototype.addChild = function(task) {
	task.setParent(this);
	this.children.push(task);
}

/**
 * Check if the task has dependencies or not.
 * @return True if the task has dependencies, or false if not.
 */
Tasks.Task.prototype.hasDependencies = function() {
	return (this.dependencies.length > 0);
}

/**
 * Adds a dependency to this task's list of dependencies.  Automatically sets
 * the dependency's owner to the current task.
 * @param dependency The dependency to add.
 */
Tasks.Task.prototype.addDependency = function(dependency) {
	
	// We need to ensure that the dependency knows it is owned by this task
	// before we add it to the task's list of dependencies.
	dependency.setOwner(this);
	
	this.dependencies.push(dependency);
}

/**
 * Gets all tasks on which this task is dependent, including all tasks that its
 * ancestors are dependent on.  This gives a complete list of all tasks that
 * directly affect the dates of this task.
 * Any phases that are encountered as dependencies are replaced with their
 * children (and if any of those is a phase, it is replaced with its children,
 * etc).
 * @return An array of all dependencies.
 */
Tasks.Task.prototype.getAllTaskDependencies = function() {
	var list = new Array();

	// Add all dependencies of this task and its ancestors
	var currentTask = this;
	while (currentTask != null) {
		for (var i in currentTask.getDependencies()) {
			var dependentOn = currentTask.getDependencies()[i].getDependentOn();
			
			if (dependentOn != null) {
				list.push(dependentOn);
			}
		}
		currentTask = currentTask.getParent();
	}
	
	// Iterate over the list and make sure it contains no chilren
	for (var i = 0; i < list.length; ++i) {
		if (list[i].hasChildren()) {
		
			var phase = list[i];
		
			// Remove the phase
			list.splice(i, 1);
			i--;
			
			// Add the phase's children to the list
			for (var j in phase.getChildren()) {
				list.push(phase.getChildren()[j]);
			}
		}
	}
	
	return list;
}

/**
 * Gets the name of the task.
 * @return The name of the task.
 */
Tasks.Task.prototype.getName = function() {
	return this.name;
}

/**
 * Gets the order number of the task.  The order number is used to display tasks
 * in the correct order.  Tasks should not have the same order number as one of
 * their siblings.
 * @return The order number of the task.
 */
Tasks.Task.prototype.getOrderNumber = function() {
	return this.orderNumber;
}

/**
 * Gets the list of dependencies that this task has.
 * @return The list of dependencies of this task.
 */
Tasks.Task.prototype.getDependencies = function() {
	return this.dependencies;
}

/**
 * Gets the date on which the task starts.
 * @return The start date of the task.
 */
Tasks.Task.prototype.getStartDate = function() {
	
	// If we have no children, we return the start date of the task
	if (!this.hasChildren()) return this.startDate;
	
	// Otherwise, we look at our children to find the earliest start date and
	// return that
	
	// Set earliest date to the maximum date JS can represent
	var earliestDate = new Date(100000000*86400000);
	
	for (var i in this.children) {
		if (this.children[i].getStartDate() < earliestDate) {
			earliestDate = this.children[i].getStartDate();
		}
	}
	
	return earliestDate;
}

/**
 * Gets the end date of the task.
 * @return The end date of the task.
 */
Tasks.Task.prototype.getEndDate = function() {

	// If we have no children, we return the end date of the task
	if (!this.hasChildren()) return this.endDate;
	
	// Otherwise, we look at our children to find the latest end date and
	// return that
	
	// Set latestDate date to the minimum date JS can represent
	var latestDate = new Date(-100000000*86400000);
	
	for (var i in this.children) {
		if (this.children[i].getEndDate() > latestDate) {
			latestDate = this.children[i].getEndDate();
		}
	}
	
	return latestDate;
}

/**
 * Gets the duration of the task in milliseconds.
 * @return The duration of the task in milliseconds.
 */
Tasks.Task.prototype.getDuration = function() {

	// If we don't have children, just return the duration
	if (!this.hasChildren()) return this.duration;
	
	// If we do have children, the duration is defined as the difference between
	// the start and end dates
	return this.getEndDate().getTime() - this.getStartDate().getTime();
}

/**
 * Recalculates the start date of the task based on the start dates of its
 * dependencies.  The earliest date that the task will use as its start date
 * (in the situation where it has no dependencies, for example) is the value
 * passed as earliestDate.
 * @param earliestDate The earliest date that the task can use as its start
 * date.
 * @param week The working week to base calculations on.
 */
Tasks.Task.prototype.recalculateDates = function(earliestDate, week) {
	var latestDate = earliestDate;
	
	for (var i in this.dependencies) {		
		var dependencyDate = this.dependencies[i].getStartDate();
		
		if (dependencyDate > latestDate) {
			latestDate = dependencyDate;
		}
		
		// Check if we have a fixed date; if so, just use that.  Type checking
		// is ugly, but it works
		if (this.dependencies[i] instanceof Tasks.FixedStartDependency) {
			latestDate = this.dependencies[i].getStartDate();
			break;
		}
	}
	
	// Ensure that the start date falls within a working shift
	this.startDate = week.getNextShift(latestDate).getStartTime();
	
	// Work out end date using working week.  We subtract 1 from the duration
	// to ensure that, should the end date be at the end of a working shift,
	// we retrieve the correct shift from the working week later
	var timeSpan = new WorkingWeek.TimeSpan(0, 0, 0, 0, this.duration - 1);
	this.endDate = week.dateAdd(this.startDate, timeSpan);
	
	// Ensure that the end date falls within a working shift
	this.endDate = week.getNextShift(this.endDate).getStartTime();
	
	// Add the millisecond back on to the date that we subtracted earlier
	this.endDate = new Date(this.endDate.getTime() + 1);
}


/** FinishToStartDependency Methods **/

/**
 * Get the start date of the task.
 * @return The start date of the task.
 */
Tasks.FinishToStartDependency.prototype.getStartDate = function() {
	return this.dependentOn.getEndDate();
}

/**
 * Set the owner of the dependency.  This is done automatically by the Task
 * object's addDependency() method and shouldn't be used elsewhere.
 * @param owner The owner of the dependency.
 */
Tasks.FinishToStartDependency.prototype.setOwner = function(owner) {
	this.owner = owner;
}

/**
 * Get the task that owns the dependency.
 * @return The task that owns the dependency.
 */
Tasks.FinishToStartDependency.prototype.getOwner = function() {
	return this.owner;
}

/**
 * Get the task that the owner is dependent on.
 * @return The task that the owner is dependent on.
 */
Tasks.FinishToStartDependency.prototype.getDependentOn = function() {
	return this.dependentOn;
}


/** FinishToFinishDependency Methods **/

/**
 * Get the start date of the task.
 * @return The start date of the task.
 */
Tasks.FinishToFinishDependency.prototype.getStartDate = function() {
	return new Date(this.dependentOn.getEndDate().getTime() - this.owner.getDuration());
}

/**
 * Set the owner of the dependency.  This is done automatically by the Task
 * object's addDependency() method and shouldn't be used elsewhere.
 * @param owner The owner of the dependency.
 */
Tasks.FinishToFinishDependency.prototype.setOwner = function(owner) {
	this.owner = owner;
}

/**
 * Get the task that owns the dependency.
 * @return The task that owns the dependency.
 */
Tasks.FinishToFinishDependency.prototype.getOwner = function() {
	return this.owner;
}

/**
 * Get the task that the owner is dependent on.
 * @return The task that the owner is dependent on.
 */
Tasks.FinishToFinishDependency.prototype.getDependentOn = function() {
	return this.dependentOn;
}


/** StartToStartDependency Methods **/

/**
 * Get the start date of the task.
 * @return The start date of the task.
 */
Tasks.StartToStartDependency.prototype.getStartDate = function() {
	return new Date(this.dependentOn.getStartDate());
}

/**
 * Set the owner of the dependency.  This is done automatically by the Task
 * object's addDependency() method and shouldn't be used elsewhere.
 * @param owner The owner of the dependency.
 */
Tasks.StartToStartDependency.prototype.setOwner = function(owner) {
	this.owner = owner;
}

/**
 * Get the task that owns the dependency.
 * @return The task that owns the dependency.
 */
Tasks.StartToStartDependency.prototype.getOwner = function() {
	return this.owner;
}

/**
 * Get the task that the owner is dependent on.
 * @return The task that the owner is dependent on.
 */
Tasks.StartToStartDependency.prototype.getDependentOn = function() {
	return this.dependentOn;
}


/** StartToFinishDependency Methods **/

/**
 * Get the start date of the task.
 * @return The start date of the task.
 */
Tasks.StartToFinishDependency.prototype.getStartDate = function() {
	return new Date(this.dependentOn.getStartDate().getTime() - this.owner.getDuration());
}

/**
 * Set the owner of the dependency.  This is done automatically by the Task
 * object's addDependency() method and shouldn't be used elsewhere.
 * @param owner The owner of the dependency.
 */
Tasks.StartToFinishDependency.prototype.setOwner = function(owner) {
	this.owner = owner;
}

/**
 * Get the task that owns the dependency.
 * @return The task that owns the dependency.
 */
Tasks.StartToFinishDependency.prototype.getOwner = function() {
	return this.owner;
}

/**
 * Get the task that the owner is dependent on.
 * @return The task that the owner is dependent on.
 */
Tasks.StartToFinishDependency.prototype.getDependentOn = function() {
	return this.dependentOn;
}


/** FixedStartDependency Methods **/

/**
 * Get the start date of the task.
 * @return The start date of the task.
 */
Tasks.FixedStartDependency.prototype.getStartDate = function() {
	return this.startDate;
}

/**
 * Set the owner of the dependency.  This is done automatically by the Task
 * object's addDependency() method and shouldn't be used elsewhere.
 * @param owner The owner of the dependency.
 */
Tasks.FixedStartDependency.prototype.setOwner = function(owner) {
	this.owner = owner;
}

/**
 * Get the task that owns the dependency.
 * @return The task that owns the dependency.
 */
Tasks.FixedStartDependency.prototype.getOwner = function() {
	return this.owner;
}

/**
 * Get the task that the owner is dependent on.
 * @return The task that the owner is dependent on.
 */
Tasks.FixedStartDependency.prototype.getDependentOn = function() {
	return this.dependentOn;
}