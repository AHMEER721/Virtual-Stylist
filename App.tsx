
import React, { useState, useCallback } from 'react';
import { ImageUploader } from './components/ImageUploader';
import { OutfitCard } from './components/OutfitCard';
import { generateOutfitDescriptions, generateOutfitImage } from './services/geminiService';
import { Outfit, OutfitGenerationState } from './types';
import { fileToBase64 } from './utils/fileUtils';

const App: React.FC = () => {
  const [uploadedImage, setUploadedImage] = useState<{ file: File; preview: string } | null>(null);
  const [outfits, setOutfits] = useState<Outfit[]>([]);
  const [generationState, setGenerationState] = useState<OutfitGenerationState>({
    isLoading: false,
    stage: '',
    error: null,
  });

  const handleImageUpload = (file: File, preview: string) => {
    setUploadedImage({ file, preview });
    setOutfits([]);
    setGenerationState({ isLoading: false, stage: '', error: null });
  };

  const handleGenerateOutfits = useCallback(async () => {
    if (!uploadedImage) return;

    setGenerationState({ isLoading: true, stage: 'Analyzing your item...', error: null });
    setOutfits([
        { title: 'Casual', description: '', imageUrl: null, isLoading: true },
        { title: 'Business', description: '', imageUrl: null, isLoading: true },
        { title: 'Night Out', description: '', imageUrl: null, isLoading: true },
    ]);

    try {
      const { base64, mimeType } = await fileToBase64(uploadedImage.file);
      const descriptions = await generateOutfitDescriptions(base64, mimeType);

      const updatedOutfits: Outfit[] = [
        { title: 'Casual', description: descriptions.casual, imageUrl: null, isLoading: true },
        { title: 'Business', description: descriptions.business, imageUrl: null, isLoading: true },
        { title: 'Night Out', description: descriptions.nightOut, imageUrl: null, isLoading: true },
      ];
      setOutfits(updatedOutfits);
      
      for (let i = 0; i < updatedOutfits.length; i++) {
        const outfit = updatedOutfits[i];
        setGenerationState(prev => ({ ...prev, stage: `Generating ${outfit.title} outfit...` }));
        
        const imageUrl = await generateOutfitImage(outfit.description);
        
        setOutfits(currentOutfits => {
            const newOutfits = [...currentOutfits];
            newOutfits[i] = { ...newOutfits[i], imageUrl, isLoading: false };
            return newOutfits;
        });
      }

      setGenerationState({ isLoading: false, stage: 'Completed!', error: null });

    } catch (err) {
      console.error(err);
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
      setGenerationState({ isLoading: false, stage: '', error: `Failed to generate outfits. ${errorMessage}` });
      setOutfits([]);
    }
  }, [uploadedImage]);

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-800">
      <main className="container mx-auto px-4 py-8 md:py-12">
        <header className="text-center mb-8 md:mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 tracking-tight">Virtual Stylist</h1>
          <p className="mt-3 text-lg text-gray-600 max-w-2xl mx-auto">
            Stuck on what to wear? Upload an item and let AI create the perfect outfit for any occasion.
          </p>
        </header>

        <div className="max-w-xl mx-auto bg-white p-6 rounded-2xl shadow-lg border border-gray-200">
          <ImageUploader onImageUpload={handleImageUpload} preview={uploadedImage?.preview} />
          {uploadedImage && (
            <button
              onClick={handleGenerateOutfits}
              disabled={generationState.isLoading}
              className="mt-6 w-full bg-indigo-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-4 focus:ring-indigo-300 transition-all duration-300 disabled:bg-indigo-300 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {generationState.isLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  {generationState.stage}
                </>
              ) : 'Generate Outfits'}
            </button>
          )}
        </div>

        {generationState.error && (
            <div className="mt-8 max-w-3xl mx-auto bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg" role="alert">
                <strong className="font-bold">Oh no! </strong>
                <span className="block sm:inline">{generationState.error}</span>
            </div>
        )}

        {outfits.length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold text-center mb-8">Your Outfit Options</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {outfits.map((outfit) => (
                <OutfitCard key={outfit.title} outfit={outfit} />
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default App;
