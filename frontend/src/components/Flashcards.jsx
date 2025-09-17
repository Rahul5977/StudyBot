import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  ArrowPathIcon,
  CheckIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";

const Flashcards = ({ darkMode = false }) => {
  const [flashcards, setFlashcards] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isReviewing, setIsReviewing] = useState(false);

  useEffect(() => {
    fetchFlashcards();
  }, []);

  const fetchFlashcards = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/flashcards");
      const data = await response.json();
      setFlashcards(data.flashcards || []);
    } catch (error) {
      console.error("Error fetching flashcards:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAnswer = async (difficulty) => {
    if (flashcards.length === 0) return;

    setIsReviewing(true);
    const currentCard = flashcards[currentIndex];

    try {
      const response = await fetch("/api/flashcards/review", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          flashcard_id: currentCard.id,
          difficulty: difficulty,
        }),
      });

      if (response.ok) {
        // Remove the reviewed card from the current session
        const newFlashcards = flashcards.filter(
          (_, index) => index !== currentIndex
        );
        setFlashcards(newFlashcards);

        // Adjust current index
        if (newFlashcards.length === 0) {
          setCurrentIndex(0);
        } else if (currentIndex >= newFlashcards.length) {
          setCurrentIndex(0);
        }

        setShowAnswer(false);
      }
    } catch (error) {
      console.error("Error updating flashcard:", error);
    } finally {
      setIsReviewing(false);
    }
  };

  const nextCard = () => {
    if (flashcards.length === 0) return;
    setCurrentIndex((prev) => (prev + 1) % flashcards.length);
    setShowAnswer(false);
  };

  const prevCard = () => {
    if (flashcards.length === 0) return;
    setCurrentIndex(
      (prev) => (prev - 1 + flashcards.length) % flashcards.length
    );
    setShowAnswer(false);
  };

  const flipCard = () => {
    setShowAnswer(!showAnswer);
  };

  if (loading) {
    return (
      <div
        className={`rounded-lg shadow-md p-8 ${
          darkMode ? "bg-gray-800" : "bg-white"
        }`}
      >
        <div className="flex items-center justify-center">
          <ArrowPathIcon
            className={`w-8 h-8 animate-spin ${
              darkMode ? "text-gray-400" : "text-gray-600"
            }`}
          />
          <span
            className={`ml-3 text-lg ${
              darkMode ? "text-gray-300" : "text-gray-700"
            }`}
          >
            Loading flashcards...
          </span>
        </div>
      </div>
    );
  }

  if (flashcards.length === 0) {
    return (
      <div
        className={`rounded-lg shadow-md p-8 text-center ${
          darkMode ? "bg-gray-800" : "bg-white"
        }`}
      >
        <div
          className={`text-6xl mb-4 ${
            darkMode ? "text-gray-600" : "text-gray-300"
          }`}
        >
          📚
        </div>
        <h3
          className={`text-xl font-semibold mb-2 ${
            darkMode ? "text-gray-200" : "text-gray-800"
          }`}
        >
          No Flashcards Due Today
        </h3>
        <p className={`${darkMode ? "text-gray-400" : "text-gray-600"}`}>
          Great job! You're all caught up with your flashcard reviews.
        </p>
      </div>
    );
  }

  const currentCard = flashcards[currentIndex];

  return (
    <div
      className={`rounded-lg shadow-md overflow-hidden ${
        darkMode ? "bg-gray-800" : "bg-white"
      }`}
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold">📚 Flashcard Review</h2>
          <div className="text-sm bg-white/20 px-3 py-1 rounded-full">
            {currentIndex + 1} of {flashcards.length}
          </div>
        </div>
      </div>

      {/* Card Container */}
      <div className="p-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={`${currentIndex}-${showAnswer}`}
            initial={{ rotateY: 180, opacity: 0 }}
            animate={{ rotateY: 0, opacity: 1 }}
            exit={{ rotateY: -180, opacity: 0 }}
            transition={{ duration: 0.6 }}
            className={`min-h-[300px] rounded-lg border-2 border-dashed p-6 cursor-pointer ${
              darkMode
                ? "border-gray-600 bg-gray-700 hover:bg-gray-650"
                : "border-gray-300 bg-gray-50 hover:bg-gray-100"
            }`}
            onClick={flipCard}
          >
            <div className="h-full flex flex-col justify-center items-center text-center">
              {!showAnswer ? (
                <>
                  <div
                    className={`text-sm font-medium mb-4 ${
                      darkMode ? "text-purple-300" : "text-purple-600"
                    }`}
                  >
                    QUESTION
                  </div>
                  <h3
                    className={`text-xl font-semibold mb-4 ${
                      darkMode ? "text-gray-200" : "text-gray-800"
                    }`}
                  >
                    {currentCard.question}
                  </h3>
                  <p
                    className={`text-sm ${
                      darkMode ? "text-gray-400" : "text-gray-600"
                    }`}
                  >
                    Click to reveal answer
                  </p>
                </>
              ) : (
                <>
                  <div
                    className={`text-sm font-medium mb-4 ${
                      darkMode ? "text-green-300" : "text-green-600"
                    }`}
                  >
                    ANSWER
                  </div>
                  <div
                    className={`text-lg mb-6 ${
                      darkMode ? "text-gray-200" : "text-gray-800"
                    }`}
                  >
                    {currentCard.answer}
                  </div>
                  {currentCard.context && (
                    <div
                      className={`text-sm p-3 rounded border-l-4 ${
                        darkMode
                          ? "bg-gray-600 border-blue-400 text-gray-300"
                          : "bg-blue-50 border-blue-400 text-blue-700"
                      }`}
                    >
                      <strong>Context:</strong> {currentCard.context}
                    </div>
                  )}
                </>
              )}
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Navigation and Actions */}
        <div className="flex justify-between items-center mt-6">
          {/* Previous/Next buttons */}
          <div className="flex gap-2">
            <button
              onClick={prevCard}
              disabled={flashcards.length <= 1}
              className={`p-2 rounded-lg transition-colors ${
                flashcards.length <= 1
                  ? darkMode
                    ? "text-gray-600 cursor-not-allowed"
                    : "text-gray-400 cursor-not-allowed"
                  : darkMode
                  ? "text-gray-300 hover:bg-gray-700"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              <ChevronLeftIcon className="w-5 h-5" />
            </button>
            <button
              onClick={nextCard}
              disabled={flashcards.length <= 1}
              className={`p-2 rounded-lg transition-colors ${
                flashcards.length <= 1
                  ? darkMode
                    ? "text-gray-600 cursor-not-allowed"
                    : "text-gray-400 cursor-not-allowed"
                  : darkMode
                  ? "text-gray-300 hover:bg-gray-700"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              <ChevronRightIcon className="w-5 h-5" />
            </button>
          </div>

          {/* Difficulty buttons (only show when answer is revealed) */}
          {showAnswer && (
            <div className="flex gap-3">
              <motion.button
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                onClick={() => handleAnswer("hard")}
                disabled={isReviewing}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                  isReviewing
                    ? "opacity-50 cursor-not-allowed"
                    : "hover:shadow-md"
                } ${
                  darkMode
                    ? "bg-red-600 hover:bg-red-700 text-white"
                    : "bg-red-500 hover:bg-red-600 text-white"
                }`}
              >
                <XMarkIcon className="w-4 h-4" />
                Hard
              </motion.button>
              <motion.button
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                onClick={() => handleAnswer("easy")}
                disabled={isReviewing}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                  isReviewing
                    ? "opacity-50 cursor-not-allowed"
                    : "hover:shadow-md"
                } ${
                  darkMode
                    ? "bg-green-600 hover:bg-green-700 text-white"
                    : "bg-green-500 hover:bg-green-600 text-white"
                }`}
              >
                <CheckIcon className="w-4 h-4" />
                Easy
              </motion.button>
            </div>
          )}
        </div>

        {/* Progress bar */}
        <div className="mt-6">
          <div className="flex justify-between text-sm mb-2">
            <span className={darkMode ? "text-gray-400" : "text-gray-600"}>
              Progress
            </span>
            <span className={darkMode ? "text-gray-400" : "text-gray-600"}>
              {Math.round(((currentIndex + 1) / flashcards.length) * 100)}%
            </span>
          </div>
          <div
            className={`w-full rounded-full h-2 ${
              darkMode ? "bg-gray-700" : "bg-gray-200"
            }`}
          >
            <motion.div
              className="bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full"
              initial={{ width: 0 }}
              animate={{
                width: `${((currentIndex + 1) / flashcards.length) * 100}%`,
              }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Flashcards;
