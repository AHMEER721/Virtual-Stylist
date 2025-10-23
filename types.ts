
export interface Outfit {
    title: 'Casual' | 'Business' | 'Night Out';
    description: string;
    imageUrl: string | null;
    isLoading: boolean;
}

export interface OutfitDescriptions {
    casual: string;
    business: string;
    nightOut: string;
}

export interface OutfitGenerationState {
    isLoading: boolean;
    stage: string;
    error: string | null;
}
