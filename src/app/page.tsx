// src/app/page.tsx
"use client";

import { useState, useEffect } from "react";

interface Task {
  id: number;
  text: string;
  completed: boolean;
  createdAt: Date;
}

type FilterType = "all" | "active" | "completed";

export default function Home() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [filter, setFilter] = useState<FilterType>("all");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingText, setEditingText] = useState("");

  // Load tasks from localStorage on component mount
  useEffect(() => {
    const savedTasks = localStorage.getItem("taskManager_tasks");
    if (savedTasks) {
      try {
        const parsedTasks: Task[] = JSON.parse(savedTasks);
        // Convert date strings back to Date objects
        const tasksWithDates = parsedTasks.map((task) => ({
          ...task,
          createdAt: new Date(task.createdAt),
        }));
        setTasks(tasksWithDates);
      } catch (error) {
        console.error("Error loading tasks from localStorage:", error);
      }
    }
  }, []);

  // Save tasks to localStorage whenever tasks change
  useEffect(() => {
    if (tasks.length > 0) {
      localStorage.setItem("taskManager_tasks", JSON.stringify(tasks));
    }
  }, [tasks]);

  // Add a new task
  const addTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim() === "") return;

    const newTask: Task = {
      id: Date.now(),
      text: inputValue.trim(),
      completed: false,
      createdAt: new Date(),
    };

    setTasks((prev) => [...prev, newTask]);
    setInputValue("");
  };

  // Toggle task completion
  const toggleTask = (id: number) => {
    setTasks((prev) =>
      prev.map((task) =>
        task.id === id ? { ...task, completed: !task.completed } : task
      )
    );
  };

  // Delete a task
  const deleteTask = (id: number) => {
    setTasks((prev) => {
      const newTasks = prev.filter((task) => task.id !== id);
      // If no tasks left, clear localStorage
      if (newTasks.length === 0) {
        localStorage.removeItem("taskManager_tasks");
      }
      return newTasks;
    });
  };

  // Clear all tasks
  const clearAllTasks = () => {
    setTasks([]);
    localStorage.removeItem("taskManager_tasks");
  };

  // Start editing a task
  const startEditing = (id: number, text: string) => {
    setEditingId(id);
    setEditingText(text);
  };

  // Save edited task
  const saveEdit = (id: number) => {
    if (editingText.trim() === "") return;

    setTasks((prev) =>
      prev.map((task) =>
        task.id === id ? { ...task, text: editingText.trim() } : task
      )
    );
    setEditingId(null);
    setEditingText("");
  };

  // Cancel editing
  const cancelEdit = () => {
    setEditingId(null);
    setEditingText("");
  };

  // Filter tasks based on current filter
  const filteredTasks = tasks.filter((task) => {
    if (filter === "active") return !task.completed;
    if (filter === "completed") return task.completed;
    return true;
  });

  // Get task counts
  const activeCount = tasks.filter((task) => !task.completed).length;
  const completedCount = tasks.filter((task) => task.completed).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
      <div className="max-w-2xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            My Task Manager
          </h1>
          <p className="text-gray-600">
            Stay organized and productive • Tasks saved automatically
          </p>
        </div>

        {/* Add Task Form */}
        <form onSubmit={addTask} className="mb-8">
          <div className="flex gap-2">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Add a new task..."
              className="flex-1 px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <button
              type="submit"
              className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
            >
              Add
            </button>
          </div>
        </form>

        {/* Filter Buttons */}
        <div className="flex justify-center gap-2 mb-6">
          {(["all", "active", "completed"] as FilterType[]).map(
            (filterType) => (
              <button
                key={filterType}
                onClick={() => setFilter(filterType)}
                className={`px-4 py-2 rounded-lg capitalize transition-colors ${
                  filter === filterType
                    ? "bg-blue-500 text-white"
                    : "bg-white text-gray-700 hover:bg-gray-50"
                }`}
              >
                {filterType}
              </button>
            )
          )}
        </div>

        {/* Task Stats */}
        <div className="bg-white rounded-lg p-4 mb-6 shadow-sm">
          <div className="flex justify-between items-center">
            <div className="flex gap-6 text-sm text-gray-600">
              <span>Total: {tasks.length}</span>
              <span>Active: {activeCount}</span>
              <span>Completed: {completedCount}</span>
            </div>
            {tasks.length > 0 && (
              <button
                onClick={clearAllTasks}
                className="px-3 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600 transition-colors"
                title="Clear all tasks"
              >
                Clear All
              </button>
            )}
          </div>
        </div>

        {/* Task List */}
        <div className="space-y-2">
          {filteredTasks.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              {tasks.length === 0
                ? "No tasks yet. Add one above to get started!"
                : `No ${filter} tasks found.`}
            </div>
          ) : (
            filteredTasks.map((task) => (
              <div
                key={task.id}
                className={`bg-white rounded-lg p-4 shadow-sm border-l-4 transition-all ${
                  task.completed
                    ? "border-green-400 bg-green-50"
                    : "border-blue-400"
                }`}
              >
                <div className="flex items-center gap-3">
                  {/* Checkbox */}
                  <input
                    type="checkbox"
                    checked={task.completed}
                    onChange={() => toggleTask(task.id)}
                    className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                  />

                  {/* Task Text */}
                  <div className="flex-1">
                    {editingId === task.id ? (
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={editingText}
                          onChange={(e) => setEditingText(e.target.value)}
                          className="flex-1 px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                          onKeyDown={(e) => {
                            if (e.key === "Enter") saveEdit(task.id);
                            if (e.key === "Escape") cancelEdit();
                          }}
                          autoFocus
                        />
                        <button
                          onClick={() => saveEdit(task.id)}
                          className="px-3 py-1 bg-green-500 text-white rounded text-sm hover:bg-green-600"
                        >
                          Save
                        </button>
                        <button
                          onClick={cancelEdit}
                          className="px-3 py-1 bg-gray-500 text-white rounded text-sm hover:bg-gray-600"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <span
                        className={`${
                          task.completed
                            ? "line-through text-gray-500"
                            : "text-gray-800"
                        }`}
                      >
                        {task.text}
                      </span>
                    )}
                  </div>

                  {/* Action Buttons */}
                  {editingId !== task.id && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => startEditing(task.id, task.text)}
                        className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600 transition-colors"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => deleteTask(task.id)}
                        className="px-3 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600 transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </div>

                {/* Created Date */}
                <div className="mt-2 text-xs text-gray-400">
                  Created: {task.createdAt.toLocaleDateString()} at{" "}
                  {task.createdAt.toLocaleTimeString()}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
