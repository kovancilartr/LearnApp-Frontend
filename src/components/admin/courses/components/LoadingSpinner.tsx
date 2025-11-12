export function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center h-64">
      <div className="flex flex-col items-center space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <div className="text-lg font-medium text-gray-600">Kurslar yükleniyor...</div>
      </div>
    </div>
  );
}