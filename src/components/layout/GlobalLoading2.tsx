import React from "react";

interface GlobalLoading2Props {
  contentText?: string;
}
const GlobalLoading2 = ({ contentText }: GlobalLoading2Props) => {
  return (
    <div className="flex items-center justify-center py-12">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      <span className="ml-3 text-gray-600">{contentText}</span>
    </div>
  );
};

export default GlobalLoading2;
