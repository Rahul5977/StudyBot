import React, { useState, useEffect } from "react";
import {
  ChevronDownIcon,
  ChevronRightIcon,
  PlusIcon,
  TrashIcon,
  PencilIcon,
} from "@heroicons/react/24/outline";

const PlanEditor = ({
  studyPlan,
  onPlanUpdate,
  isEditing = false,
  darkMode = false,
}) => {
  const [plan, setPlan] = useState(studyPlan || null);
  const [expandedSections, setExpandedSections] = useState(new Set());
  const [editingItem, setEditingItem] = useState(null);
  const [editValue, setEditValue] = useState("");

  useEffect(() => {
    setPlan(studyPlan);
    // Expand all sections by default
    if (studyPlan?.sections) {
      setExpandedSections(new Set(studyPlan.sections.map((s) => s.id)));
    }
  }, [studyPlan]);

  const toggleSection = (sectionId) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(sectionId)) {
      newExpanded.delete(sectionId);
    } else {
      newExpanded.add(sectionId);
    }
    setExpandedSections(newExpanded);
  };

  const startEdit = (type, id, currentValue) => {
    setEditingItem({ type, id });
    setEditValue(currentValue);
  };

  const saveEdit = () => {
    if (!editingItem || !isEditing) return;

    const updatedPlan = { ...plan };
    const { type, id } = editingItem;

    if (type === "title") {
      updatedPlan.title = editValue;
    } else if (type === "overview") {
      updatedPlan.overview = editValue;
    } else if (type === "section_title") {
      const section = updatedPlan.sections.find((s) => s.id === id);
      if (section) section.title = editValue;
    } else if (type === "section_description") {
      const section = updatedPlan.sections.find((s) => s.id === id);
      if (section) section.description = editValue;
    }

    setPlan(updatedPlan);
    onPlanUpdate?.(updatedPlan);
    setEditingItem(null);
    setEditValue("");
  };

  const cancelEdit = () => {
    setEditingItem(null);
    setEditValue("");
  };

  const addSubsection = (sectionId) => {
    if (!isEditing) return;

    const updatedPlan = { ...plan };
    const section = updatedPlan.sections.find((s) => s.id === sectionId);

    if (section) {
      const newSubsection = {
        id: `subsection_${Date.now()}`,
        title: "New Subsection",
        content: "Description of this subsection",
        activities: ["New activity"],
        resources: ["New resource"],
        estimated_time: "1 hour",
      };

      section.subsections = section.subsections || [];
      section.subsections.push(newSubsection);

      setPlan(updatedPlan);
      onPlanUpdate?.(updatedPlan);
    }
  };

  const removeSubsection = (sectionId, subsectionId) => {
    if (!isEditing) return;

    const updatedPlan = { ...plan };
    const section = updatedPlan.sections.find((s) => s.id === sectionId);

    if (section && section.subsections) {
      section.subsections = section.subsections.filter(
        (sub) => sub.id !== subsectionId
      );
      setPlan(updatedPlan);
      onPlanUpdate?.(updatedPlan);
    }
  };

  const EditableText = ({ type, id, value, className, placeholder }) => {
    const isCurrentlyEditing =
      editingItem?.type === type && editingItem?.id === id;

    if (isCurrentlyEditing) {
      return (
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            className={`flex-1 px-2 py-1 border rounded text-sm ${
              darkMode
                ? "bg-gray-700 border-gray-600 text-white"
                : "bg-white border-gray-300 text-gray-900"
            }`}
            placeholder={placeholder}
            autoFocus
            onBlur={saveEdit}
            onKeyDown={(e) => {
              if (e.key === "Enter") saveEdit();
              if (e.key === "Escape") cancelEdit();
            }}
          />
        </div>
      );
    }

    return (
      <div className={`group flex items-center gap-2 ${className}`}>
        <span>{value}</span>
        {isEditing && (
          <button
            onClick={() => startEdit(type, id, value)}
            className={`opacity-0 group-hover:opacity-100 p-1 rounded ${
              darkMode ? "hover:bg-gray-600" : "hover:bg-gray-100"
            }`}
          >
            <PencilIcon
              className={`w-3 h-3 ${
                darkMode ? "text-gray-400" : "text-gray-500"
              }`}
            />
          </button>
        )}
      </div>
    );
  };

  if (!plan) {
    return (
      <div
        className={`rounded-lg shadow-md p-6 ${
          darkMode ? "bg-gray-800" : "bg-white"
        }`}
      >
        <div
          className={`text-center ${
            darkMode ? "text-gray-400" : "text-gray-500"
          }`}
        >
          <h3
            className={`text-lg font-medium mb-2 ${
              darkMode ? "text-gray-300" : "text-gray-700"
            }`}
          >
            No Study Plan Available
          </h3>
          <p className="text-sm">
            Create a study plan by asking the AI to generate one for you.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`rounded-lg shadow-md overflow-hidden ${
        darkMode ? "bg-gray-800" : "bg-white"
      }`}
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
        <EditableText
          type="title"
          id="main"
          value={plan.title || "Study Plan"}
          className="text-2xl font-bold"
          placeholder="Enter plan title"
        />

        <EditableText
          type="overview"
          id="main"
          value={plan.overview || "No overview provided"}
          className="text-blue-100 mt-2"
          placeholder="Enter plan overview"
        />

        <div className="flex gap-4 mt-4 text-sm">
          <div className="bg-white/20 px-3 py-1 rounded-full">
            📅 {plan.duration || "Duration not specified"}
          </div>
          <div className="bg-white/20 px-3 py-1 rounded-full">
            📊 {plan.difficulty || "Difficulty not specified"}
          </div>
        </div>
      </div>

      {/* Prerequisites */}
      {plan.prerequisites && plan.prerequisites.length > 0 && (
        <div
          className={`border-l-4 border-yellow-400 p-4 ${
            darkMode
              ? "bg-yellow-900/20 text-yellow-200"
              : "bg-yellow-50 text-yellow-700"
          }`}
        >
          <h4
            className={`font-medium mb-2 ${
              darkMode ? "text-yellow-300" : "text-yellow-800"
            }`}
          >
            📋 Prerequisites
          </h4>
          <ul className="text-sm space-y-1">
            {plan.prerequisites.map((prereq, index) => (
              <li key={index} className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-yellow-500 rounded-full"></span>
                {prereq}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Sections */}
      <div className="p-6">
        {plan.sections && plan.sections.length > 0 ? (
          <div className="space-y-4">
            {plan.sections.map((section, sectionIndex) => (
              <div
                key={section.id || sectionIndex}
                className={`border rounded-lg overflow-hidden ${
                  darkMode ? "border-gray-600" : "border-gray-200"
                }`}
              >
                {/* Section Header */}
                <div
                  className={`p-4 cursor-pointer transition-colors ${
                    darkMode
                      ? "bg-gray-700 hover:bg-gray-600"
                      : "bg-gray-50 hover:bg-gray-100"
                  }`}
                  onClick={() => toggleSection(section.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {expandedSections.has(section.id) ? (
                        <ChevronDownIcon
                          className={`w-5 h-5 ${
                            darkMode ? "text-gray-400" : "text-gray-500"
                          }`}
                        />
                      ) : (
                        <ChevronRightIcon
                          className={`w-5 h-5 ${
                            darkMode ? "text-gray-400" : "text-gray-500"
                          }`}
                        />
                      )}

                      <div>
                        <EditableText
                          type="section_title"
                          id={section.id}
                          value={section.title || `Section ${sectionIndex + 1}`}
                          className={`font-medium ${
                            darkMode ? "text-gray-100" : "text-gray-900"
                          }`}
                          placeholder="Enter section title"
                        />
                        <div
                          className={`text-sm mt-1 ${
                            darkMode ? "text-gray-400" : "text-gray-600"
                          }`}
                        >
                          ⏱️ {section.duration || "Duration not specified"}
                        </div>
                      </div>
                    </div>

                    {isEditing && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          addSubsection(section.id);
                        }}
                        className={`p-2 text-blue-600 rounded transition-colors ${
                          darkMode ? "hover:bg-blue-900/20" : "hover:bg-blue-50"
                        }`}
                        title="Add subsection"
                      >
                        <PlusIcon className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Section Content */}
                {expandedSections.has(section.id) && (
                  <div
                    className={`p-4 border-t ${
                      darkMode
                        ? "bg-gray-800 border-gray-600"
                        : "bg-white border-gray-200"
                    }`}
                  >
                    <EditableText
                      type="section_description"
                      id={section.id}
                      value={section.description || "No description provided"}
                      className={`mb-4 ${
                        darkMode ? "text-gray-300" : "text-gray-700"
                      }`}
                      placeholder="Enter section description"
                    />

                    {/* Learning Objectives */}
                    {section.learning_objectives &&
                      section.learning_objectives.length > 0 && (
                        <div className="mb-4">
                          <h5
                            className={`font-medium mb-2 ${
                              darkMode ? "text-gray-200" : "text-gray-900"
                            }`}
                          >
                            🎯 Learning Objectives
                          </h5>
                          <ul
                            className={`text-sm space-y-1 ml-4 ${
                              darkMode ? "text-gray-400" : "text-gray-600"
                            }`}
                          >
                            {section.learning_objectives.map(
                              (objective, index) => (
                                <li
                                  key={index}
                                  className="flex items-start gap-2"
                                >
                                  <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0"></span>
                                  {objective}
                                </li>
                              )
                            )}
                          </ul>
                        </div>
                      )}

                    {/* Subsections */}
                    {section.subsections && section.subsections.length > 0 && (
                      <div className="space-y-3">
                        <h5
                          className={`font-medium ${
                            darkMode ? "text-gray-200" : "text-gray-900"
                          }`}
                        >
                          📚 Subsections
                        </h5>
                        {section.subsections.map((subsection, subIndex) => (
                          <div
                            key={subsection.id || subIndex}
                            className={`p-3 rounded border ${
                              darkMode
                                ? "bg-gray-700 border-gray-600"
                                : "bg-gray-50 border-gray-200"
                            }`}
                          >
                            <div className="flex justify-between items-start">
                              <div className="flex-1">
                                <h6
                                  className={`font-medium mb-1 ${
                                    darkMode ? "text-gray-200" : "text-gray-800"
                                  }`}
                                >
                                  {subsection.title ||
                                    `Subsection ${subIndex + 1}`}
                                </h6>
                                <p
                                  className={`text-sm mb-2 ${
                                    darkMode ? "text-gray-400" : "text-gray-600"
                                  }`}
                                >
                                  {subsection.content ||
                                    "No content description"}
                                </p>

                                <div
                                  className={`text-xs ${
                                    darkMode ? "text-gray-500" : "text-gray-500"
                                  }`}
                                >
                                  ⏰{" "}
                                  {subsection.estimated_time ||
                                    "Time not specified"}
                                </div>

                                {/* Activities */}
                                {subsection.activities &&
                                  subsection.activities.length > 0 && (
                                    <div className="mt-2">
                                      <div
                                        className={`text-xs font-medium mb-1 ${
                                          darkMode
                                            ? "text-gray-300"
                                            : "text-gray-700"
                                        }`}
                                      >
                                        Activities:
                                      </div>
                                      <ul
                                        className={`text-xs space-y-0.5 ${
                                          darkMode
                                            ? "text-gray-400"
                                            : "text-gray-600"
                                        }`}
                                      >
                                        {subsection.activities.map(
                                          (activity, idx) => (
                                            <li
                                              key={idx}
                                              className="flex items-center gap-1"
                                            >
                                              <span className="w-1 h-1 bg-green-500 rounded-full"></span>
                                              {activity}
                                            </li>
                                          )
                                        )}
                                      </ul>
                                    </div>
                                  )}

                                {/* Resources */}
                                {subsection.resources &&
                                  subsection.resources.length > 0 && (
                                    <div className="mt-2">
                                      <div
                                        className={`text-xs font-medium mb-1 ${
                                          darkMode
                                            ? "text-gray-300"
                                            : "text-gray-700"
                                        }`}
                                      >
                                        Resources:
                                      </div>
                                      <ul
                                        className={`text-xs space-y-0.5 ${
                                          darkMode
                                            ? "text-gray-400"
                                            : "text-gray-600"
                                        }`}
                                      >
                                        {subsection.resources.map(
                                          (resource, idx) => (
                                            <li
                                              key={idx}
                                              className="flex items-center gap-1"
                                            >
                                              <span className="w-1 h-1 bg-purple-500 rounded-full"></span>
                                              {resource}
                                            </li>
                                          )
                                        )}
                                      </ul>
                                    </div>
                                  )}
                              </div>

                              {isEditing && (
                                <button
                                  onClick={() =>
                                    removeSubsection(section.id, subsection.id)
                                  }
                                  className={`p-1 text-red-500 rounded ml-2 ${
                                    darkMode
                                      ? "hover:bg-red-900/20"
                                      : "hover:bg-red-50"
                                  }`}
                                  title="Remove subsection"
                                >
                                  <TrashIcon className="w-3 h-3" />
                                </button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div
            className={`text-center py-8 ${
              darkMode ? "text-gray-400" : "text-gray-500"
            }`}
          >
            <p>No sections available in this study plan.</p>
          </div>
        )}
      </div>

      {/* Final Assessment */}
      {plan.final_assessment && (
        <div
          className={`border-l-4 border-green-400 p-4 m-6 rounded ${
            darkMode
              ? "bg-green-900/20 text-green-200"
              : "bg-green-50 text-green-700"
          }`}
        >
          <h4
            className={`font-medium mb-2 ${
              darkMode ? "text-green-300" : "text-green-800"
            }`}
          >
            🏆 Final Assessment
          </h4>
          <p className="text-sm">{plan.final_assessment}</p>
        </div>
      )}
    </div>
  );
};

export default PlanEditor;
