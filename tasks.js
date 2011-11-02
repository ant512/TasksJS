var Tasks = {

	/**
	 * Task object.
	 * @param name Name of the task.
	 * @param duration The length of the task in milliseconds.
	 */
	Task: function(name, duration) {
		this.name = name;
		this.startDate = new Date();
		this.endDate = new Date();
		this.dependencies = new Array();
		this.duration = duration;
		this.parent = null;
		this.children = new Array();
	},
	
	/**
	 * Used to calculate the start dates of all tasks.
	 */
	DateCalculator: function() { },
	
	/**
	 * Base dependency object.  Instances of this object should not be created
	 * as it doesn't do anything on its own.
	 * @param dependentOn The task on which the dependency's owner is dependent.
	 * @param lag Time between the dependentOn task ending/starting (as
	 * appropriate) and the next task starting/ending (ditto).
	 */
	Dependency: function(dependentOn, lag) {
		this.owner = null;
		this.dependentOn = dependentOn;
		this.lag = lag;
	},
	
	/**
	 * Owning task will start when the task it is dependent on finishes.
	 * @param dependentOn Task that this task is dependent on.
	 * @param lag Time between dependentOn finishing and owning task starting.
	 */
	FinishToStartDependency: function(dependentOn, lag) {
		Tasks.Dependency.prototype.constructor.call(this, dependentOn, lag);
	},
	
	/**
	 * Owning task will finish when the task it is dependent on finishes.
	 * @param dependentOn Task that this task is dependent on.
	 * @param lag Time between dependentOn finishing and owning task finishing.
	 */
	FinishToFinishDependency: function(dependentOn, lag) {
		Tasks.Dependency.prototype.constructor.call(this, dependentOn, lag);
	},
	
	/**
	 * Owning task will start when the task it is dependent on starts.
	 * @param dependentOn Task that this task is dependent on.
	 * @param lag Time between dependentOn starting and owning task starting.
	 */
	StartToStartDependency: function(dependentOn, lag) {
		Tasks.Dependency.prototype.constructor.call(this, dependentOn, lag);
	},
	
	/**
	 * Owning task will finish when the task it is dependent on starts.
	 * @param dependentOn Task that this task is dependent on.
	 * @param lag Time between dependentOn starting and owning task finishing.
	 */
	StartToFinishDependency: function(dependentOn, lag) {
		Tasks.Dependency.prototype.constructor.call(this, dependentOn, lag);
	},
	
	/**
	 * Owning task will start on the specified date.
	 * @param startDate Date on which the task will start.
	 */
	FixedStartDependency: function(startDate) {
		Tasks.Dependency.prototype.constructor.call(this, null, 0);
		this.startDate = startDate;
	},
	
	/**
	 * Owning task will end on the specified date.
	 * @param endDate Date on which the task will end.
	 */
	FixedFinishDependency: function(endDate) {
		Tasks.Dependency.prototype.constructor.call(this, null, 0);
		this.endDate = endDate;
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
 * +-----+         |
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
 * @param taskList The array/tree hybrid data structure that contains the
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
 * @param taskList The array/tree hybrid data structure that contains the
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
 * Recalculates the start date of all tasks in the list.  Relies on the
 * getSortedList() function to ensure that all tasks on which task T is
 * dependent on are calculated before T is reached.  Recalculating dates becomes
 * a simple matter of asking the task's dependencies for their start dates, and
 * choosing the latest date.
 * @param tasks The array/tree hybrid data structure that contains the
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

	// Get a list of all dependencies that affect this task.  That includes all
	// dependencies that this task has and that its parents have.
	var allDependencies = new Array();
	var task = this;

	while (task != null) {
		for (var i in task.getDependencies()) {
			allDependencies.push(task.getDependencies()[i]);
		}

		task = task.getParent();
	}

	var latestDate = earliestDate;
	
	for (var i in allDependencies) {		
		var dependencyDate = allDependencies[i].getStartDate(week);
		
		// Only update the date if the dependency starts later than the
		// currently calculated date
		if (dependencyDate > latestDate) {
			latestDate = dependencyDate;
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


/** Dependency Methods **/

/**
 * Set the owner of the dependency.  This is done automatically by the Task
 * object's addDependency() method and shouldn't be used elsewhere.
 * @param owner The owner of the dependency.
 */
Tasks.Dependency.prototype.setOwner = function(owner) {
	this.owner = owner;
}

/**
 * Get the task that owns the dependency.
 * @return The task that owns the dependency.
 */
Tasks.Dependency.prototype.getOwner = function() {
	return this.owner;
}

/**
 * Get the task that the owner is dependent on.
 * @return The task that the owner is dependent on.
 */
Tasks.Dependency.prototype.getDependentOn = function() {
	return this.dependentOn;
}

/**
 * Get the lag of the dependency.
 * @return The lag of the dependency.
 */
Tasks.Dependency.prototype.getLag = function() {
	return this.lag;
}

/**
 * Set the lag of the dependency.
 * @param lag The lag of the dependency.
 */
Tasks.Dependency.prototype.setLag = function(lag) {
	this.lag = lag;
}


/** FinishToStartDependency Methods **/
Tasks.FinishToStartDependency.prototype = new Tasks.Dependency;
Tasks.FinishToStartDependency.prototype.constructor = Tasks.FinishToStartDependency;

/**
 * Get the start date of the task.
 * @param week The working week to use for date calculations.
 * @return The start date of the task.
 */
Tasks.FinishToStartDependency.prototype.getStartDate = function(week) {
	return week.dateAdd(this.dependentOn.getEndDate(), new WorkingWeek.TimeSpan(0, 0, 0, 0, this.lag));
}


/** FinishToFinishDependency Methods **/
Tasks.FinishToFinishDependency.prototype = new Tasks.Dependency;
Tasks.FinishToFinishDependency.prototype.constructor = Tasks.FinishToFinishDependency;

/**
 * Get the start date of the task.
 * @param week The working week to use for date calculations.
 * @return The start date of the task.
 */
Tasks.FinishToFinishDependency.prototype.getStartDate = function(week) {
	return week.dateAdd(this.dependentOn.getEndDate(), new WorkingWeek.TimeSpan(0, 0, 0, 0, -this.owner.getDuration() + this.lag));
}


/** StartToStartDependency Methods **/
Tasks.StartToStartDependency.prototype = new Tasks.Dependency;
Tasks.StartToStartDependency.prototype.constructor = Tasks.StartToStartDependency;

/**
 * Get the start date of the task.
 * @param week The working week to use for date calculations.
 * @return The start date of the task.
 */
Tasks.StartToStartDependency.prototype.getStartDate = function(week) {
	return week.dateAdd(this.dependentOn.getStartDate(), new WorkingWeek.TimeSpan(0, 0, 0, 0, this.lag));
}


/** StartToFinishDependency Methods **/
Tasks.StartToFinishDependency.prototype = new Tasks.Dependency;
Tasks.StartToFinishDependency.prototype.constructor = Tasks.StartToFinishDependency;

/**
 * Get the start date of the task.
 * @param week The working week to use for date calculations.
 * @return The start date of the task.
 */
Tasks.StartToFinishDependency.prototype.getStartDate = function(week) {
	return week.dateAdd(this.dependentOn.getStartDate(), new WorkingWeek.TimeSpan(0, 0, 0, 0, -this.owner.getDuration() + this.lag));
}


/** FixedStartDependency Methods **/
Tasks.FixedStartDependency.prototype = new Tasks.Dependency;
Tasks.FixedStartDependency.prototype.constructor = Tasks.FixedStartDependency;

/**
 * Get the start date of the task.
 * @param week The working week to use for date calculations.
 * @return The start date of the task.
 */
Tasks.FixedStartDependency.prototype.getStartDate = function(week) {
	return this.startDate;
}


/** FixedFinishDependency Methods **/
Tasks.FixedFinishDependency.prototype = new Tasks.Dependency;
Tasks.FixedFinishDependency.prototype.constructor = Tasks.FixedFinishDependency;

/**
 * Get the start date of the task.
 * @param week The working week to use for date calculations.
 * @return The start date of the task.
 */
Tasks.FixedFinishDependency.prototype.getStartDate = function(week) {
	return week.dateAdd(this.endDate, new WorkingWeek.TimeSpan(0, 0, 0, 0, -this.owner.getDuration()));
}
