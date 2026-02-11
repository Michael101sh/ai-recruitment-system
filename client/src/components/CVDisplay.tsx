interface CVDisplayProps {
  cv: string | null;
  isLoading: boolean;
}

export const CVDisplay: React.FC<CVDisplayProps> = ({ cv, isLoading }) => {
  if (isLoading) {
    return (
      <div className="p-6 bg-white rounded-lg shadow-md">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" />
          <span className="ml-4 text-gray-600 text-lg">Generating CV with AI...</span>
        </div>
      </div>
    );
  }

  if (!cv) {
    return (
      <div className="p-6 bg-white rounded-lg shadow-md">
        <h2 className="text-xl font-semibold text-gray-800 mb-3">Generated CV</h2>
        <p className="text-gray-500 text-center py-8">
          Submit a candidate to generate their CV.
        </p>
      </div>
    );
  }

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Generated CV</h2>
      <div className="border border-gray-200 rounded-lg p-6 bg-gray-50 max-h-[600px] overflow-y-auto">
        <pre className="whitespace-pre-wrap text-sm text-gray-700 font-sans leading-relaxed">
          {cv}
        </pre>
      </div>
    </div>
  );
};
