import React from "react";

const GlobalLoading = () => {
  return (
    <div className="fixed inset-0 bg-white bg-opacity-80 dark:bg-gray-900 dark:bg-opacity-80 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="text-center">
        <div className="relative inline-block">
          {/* Animated dots */}
          <div className="flex space-x-2 justify-center mb-4">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="w-3 h-3 bg-blue-600 rounded-full animate-bounce"
                style={{ animationDelay: `${i * 0.1}s` }}
              />
            ))}
          </div>

          {/* Optional logo or icon */}
          <svg
            className="w-16 h-16 mx-auto text-blue-600 animate-pulse"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4"
            />
          </svg>
        </div>

        <p className="mt-4 text-lg font-medium text-gray-700 dark:text-gray-300">
          Yükleniyor...
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Lütfen bekleyin
        </p>
      </div>
    </div>
  );
};

export default GlobalLoading;
