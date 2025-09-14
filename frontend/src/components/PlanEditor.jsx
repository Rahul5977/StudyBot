import React, { useState, useEffect } from "react";
import {
  ChevronDownIcon,
  ChevronRightIcon,
  PlusIcon,
  TrashIcon,
  PencilIcon,
} from "@heroicons/react/24/outline";

const PlanEditor = ({ studyPlan, onPlanUpdate, isEditing = false }) => {
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
            className="flex-1 px-2 py-1 border rounded text-sm"
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
            className="opacity-0 group-hover:opacity-100 p-1 hover:bg-gray-100 rounded"
          >
            <PencilIcon className="w-3 h-3 text-gray-500" />
          </button>
        )}
      </div>
    );
  };

  if (!plan) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="text-center text-gray-500">
          <h3 className="text-lg font-medium mb-2">No Study Plan Available</h3>
          <p className="text-sm">
            Create a study plan by asking the AI to generate one for you.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
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
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
          <h4 className="font-medium text-yellow-800 mb-2">📋 Prerequisites</h4>
          <ul className="text-sm text-yellow-700 space-y-1">
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
                className="border rounded-lg overflow-hidden"
              >
                {/* Section Header */}
                <div
                  className="bg-gray-50 p-4 cursor-pointer hover:bg-gray-100 transition-colors"
                  onClick={() => toggleSection(section.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {expandedSections.has(section.id) ? (
                        <ChevronDownIcon className="w-5 h-5 text-gray-500" />
                      ) : (
                        <ChevronRightIcon className="w-5 h-5 text-gray-500" />
                      )}

                      <div>
                        <EditableText
                          type="section_title"
                          id={section.id}
                          value={section.title || `Section ${sectionIndex + 1}`}
                          className="font-medium text-gray-900"
                          placeholder="Enter section title"
                        />
                        <div className="text-sm text-gray-600 mt-1">
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
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                        title="Add subsection"
                      >
                        <PlusIcon className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Section Content */}
                {expandedSections.has(section.id) && (
                  <div className="p-4 border-t bg-white">
                    <EditableText
                      type="section_description"
                      id={section.id}
                      value={section.description || "No description provided"}
                      className="text-gray-700 mb-4"
                      placeholder="Enter section description"
                    />

                    {/* Learning Objectives */}
                    {section.learning_objectives &&
                      section.learning_objectives.length > 0 && (
                        <div className="mb-4">
                          <h5 className="font-medium text-gray-900 mb-2">
                            🎯 Learning Objectives
                          </h5>
                          <ul className="text-sm text-gray-600 space-y-1 ml-4">
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
                        <h5 className="font-medium text-gray-900">
                          📚 Subsections
                        </h5>
                        {section.subsections.map((subsection, subIndex) => (
                          <div
                            key={subsection.id || subIndex}
                            className="bg-gray-50 p-3 rounded border"
                          >
                            <div className="flex justify-between items-start">
                              <div className="flex-1">
                                <h6 className="font-medium text-gray-800 mb-1">
                                  {subsection.title ||
                                    `Subsection ${subIndex + 1}`}
                                </h6>
                                <p className="text-sm text-gray-600 mb-2">
                                  {subsection.content ||
                                    "No content description"}
                                </p>

                                <div className="text-xs text-gray-500">
                                  ⏰{" "}
                                  {subsection.estimated_time ||
                                    "Time not specified"}
                                </div>

                                {/* Activities */}
                                {subsection.activities &&
                                  subsection.activities.length > 0 && (
                                    <div className="mt-2">
                                      <div className="text-xs font-medium text-gray-700 mb-1">
                                        Activities:
                                      </div>
                                      <ul className="text-xs text-gray-600 space-y-0.5">
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
                                      <div className="text-xs font-medium text-gray-700 mb-1">
                                        Resources:
                                      </div>
                                      <ul className="text-xs text-gray-600 space-y-0.5">
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
                                  className="p-1 text-red-500 hover:bg-red-50 rounded ml-2"
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
          <div className="text-center text-gray-500 py-8">
            <p>No sections available in this study plan.</p>
          </div>
        )}
      </div>

      {/* Final Assessment */}
      {plan.final_assessment && (
        <div className="bg-green-50 border-l-4 border-green-400 p-4 m-6 rounded">
          <h4 className="font-medium text-green-800 mb-2">
            🏆 Final Assessment
          </h4>
          <p className="text-sm text-green-700">{plan.final_assessment}</p>
        </div>
      )}
    </div>
  );
};

export default PlanEditor;
