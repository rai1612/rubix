// Dynamic algorithm filtering system based on algorithm sets
// Each algorithm set has its own specific filtering criteria

import { AlgorithmSet } from '../services/algorithmService';

export interface AlgorithmGroup {
  name: string;
  caseNumbers?: number[];
  tags?: string[];
  description?: string;
  filterFunction?: (algorithm: any) => boolean;
}

// OLL-specific groups based on case shapes and patterns
export const OLL_GROUPS: Record<string, AlgorithmGroup> = {
  "all-edges-oriented": {
    name: "All Edges Oriented Correctly",
    caseNumbers: [26, 27, 21, 22, 24, 25, 23],
    description: "Cases where all edge pieces are already oriented correctly"
  },
  "t-shapes": {
    name: "T-Shapes",
    caseNumbers: [33, 45],
    description: "Cases that form a T-like pattern"
  },
  "squares": {
    name: "Squares",
    caseNumbers: [5, 6],
    description: "Cases that form square patterns"
  },
  "c-shapes": {
    name: "C-Shapes",
    caseNumbers: [34, 46],
    description: "Cases that form C-like patterns"
  },
  "w-shapes": {
    name: "W-Shapes",
    caseNumbers: [36, 38],
    description: "Cases that form W-like patterns"
  },
  "corners-correct-edges-flipped": {
    name: "Corners Correct, Edges Flipped",
    caseNumbers: [28, 57],
    description: "Cases where corners are oriented but edges need flipping"
  },
  "p-shapes": {
    name: "P-Shapes",
    caseNumbers: [31, 32, 43, 44],
    description: "Cases that form P-like patterns"
  },
  "i-shapes": {
    name: "I-Shapes",
    caseNumbers: [51, 56, 52, 55],
    description: "Cases that form I-like or line patterns"
  },
  "fish-shapes": {
    name: "Fish-Shapes",
    caseNumbers: [9, 10, 35, 37],
    description: "Cases that resemble fish patterns"
  },
  "knight-move-shapes": {
    name: "Knight Move Shapes",
    caseNumbers: [13, 14, 15, 16],
    description: "Cases that follow knight move patterns"
  },
  "awkward-shapes": {
    name: "Awkward Shapes",
    caseNumbers: [29, 30, 41, 42],
    description: "Cases with irregular or awkward patterns"
  },
  "l-shapes": {
    name: "L-Shapes",
    caseNumbers: [48, 47, 49, 50, 53, 54],
    description: "Cases that form L-like patterns"
  },
  "lightning-bolts": {
    name: "Lightning Bolts",
    caseNumbers: [7, 8, 11, 12, 39, 40],
    description: "Cases that resemble lightning bolt patterns"
  },
  "no-edges-flipped": {
    name: "No Edges Flipped Correctly",
    caseNumbers: [1, 2, 3, 4, 18, 19, 17, 20],
    description: "Cases where no edges are oriented correctly"
  }
};

// PLL-specific groups based on permutation types
export const PLL_GROUPS: Record<string, AlgorithmGroup> = {
  "adjacent-corner-swaps": {
    name: "Adjacent Corner Swaps",
    tags: ["corner-swap", "adjacent"],
    description: "Algorithms that swap two adjacent corners"
  },
  "diagonal-corner-swaps": {
    name: "Diagonal Corner Swaps", 
    tags: ["corner-swap", "diagonal"],
    description: "Algorithms that swap two diagonal corners"
  },
  "edge-cycles": {
    name: "Edge Cycles",
    tags: ["edge-cycle", "3-cycle"],
    description: "Algorithms that cycle three edges"
  },
  "double-swaps": {
    name: "Double Swaps",
    tags: ["double-swap"],
    description: "Algorithms that perform two separate swaps"
  },
  "g-perms": {
    name: "G Permutations",
    tags: ["g-perm"],
    description: "G permutation algorithms"
  },
  "a-perms": {
    name: "A Permutations", 
    tags: ["a-perm"],
    description: "A permutation algorithms"
  },
  "t-perms": {
    name: "T Permutations",
    tags: ["t-perm"],
    description: "T permutation algorithms"
  },
  "j-perms": {
    name: "J Permutations",
    tags: ["j-perm"],
    description: "J permutation algorithms"
  },
  "r-perms": {
    name: "R Permutations",
    tags: ["r-perm"],
    description: "R permutation algorithms"
  },
  "f-perms": {
    name: "F Permutations",
    tags: ["f-perm"],
    description: "F permutation algorithms"
  }
};

// F2L-specific groups
export const F2L_GROUPS: Record<string, AlgorithmGroup> = {
  "basic-cases": {
    name: "Basic Cases",
    tags: ["basic", "beginner"],
    description: "Basic F2L insertion cases"
  },
  "corner-oriented": {
    name: "Corner Oriented",
    tags: ["corner-oriented"],
    description: "Cases where the corner is already oriented"
  },
  "edge-oriented": {
    name: "Edge Oriented", 
    tags: ["edge-oriented"],
    description: "Cases where the edge is already oriented"
  },
  "both-oriented": {
    name: "Both Oriented",
    tags: ["both-oriented"],
    description: "Cases where both pieces are oriented"
  },
  "separated-pieces": {
    name: "Separated Pieces",
    tags: ["separated"],
    description: "Cases where corner and edge are separated"
  },
  "connected-pieces": {
    name: "Connected Pieces",
    tags: ["connected"],
    description: "Cases where corner and edge are connected"
  },
  "advanced-cases": {
    name: "Advanced Cases",
    tags: ["advanced", "expert"],
    description: "Advanced F2L cases requiring complex algorithms"
  }
};

// CMLL-specific groups
export const CMLL_GROUPS: Record<string, AlgorithmGroup> = {
  "o-cases": {
    name: "O Cases",
    tags: ["o-case"],
    description: "O-shaped CMLL cases"
  },
  "h-cases": {
    name: "H Cases", 
    tags: ["h-case"],
    description: "H-shaped CMLL cases"
  },
  "pi-cases": {
    name: "Pi Cases",
    tags: ["pi-case"],
    description: "Pi-shaped CMLL cases"
  },
  "u-cases": {
    name: "U Cases",
    tags: ["u-case"],
    description: "U-shaped CMLL cases"
  },
  "t-cases": {
    name: "T Cases",
    tags: ["t-case"],
    description: "T-shaped CMLL cases"
  },
  "s-cases": {
    name: "S Cases",
    tags: ["s-case"],
    description: "S-shaped CMLL cases"
  },
  "l-cases": {
    name: "L Cases",
    tags: ["l-case"],
    description: "L-shaped CMLL cases"
  }
};

// Generic groups for other algorithm sets
export const GENERIC_GROUPS: Record<string, AlgorithmGroup> = {
  "beginner": {
    name: "Beginner",
    tags: ["beginner"],
    description: "Beginner-friendly algorithms"
  },
  "intermediate": {
    name: "Intermediate",
    tags: ["intermediate"],
    description: "Intermediate level algorithms"
  },
  "advanced": {
    name: "Advanced", 
    tags: ["advanced"],
    description: "Advanced algorithms"
  },
  "expert": {
    name: "Expert",
    tags: ["expert"],
    description: "Expert level algorithms"
  },
  "short-algorithms": {
    name: "Short Algorithms",
    description: "Algorithms with 8 moves or fewer",
    filterFunction: (algorithm) => (algorithm.moveCount || 0) <= 8
  },
  "long-algorithms": {
    name: "Long Algorithms",
    description: "Algorithms with more than 12 moves", 
    filterFunction: (algorithm) => (algorithm.moveCount || 0) > 12
  }
};

// Get groups for a specific algorithm set
export const getGroupsForAlgorithmSet = (algorithmSet: AlgorithmSet | null): Record<string, AlgorithmGroup> => {
  switch (algorithmSet) {
    case AlgorithmSet.OLL:
      return OLL_GROUPS;
    case AlgorithmSet.PLL:
      return PLL_GROUPS;
    case AlgorithmSet.F2L:
      return F2L_GROUPS;
    case AlgorithmSet.CMLL:
      return CMLL_GROUPS;
    default:
      return GENERIC_GROUPS;
  }
};

// Get all group options for UI based on selected algorithm set
export const getGroupOptionsForAlgorithmSet = (algorithmSet: AlgorithmSet | null): Array<{ value: string; label: string; description?: string }> => {
  const groups = getGroupsForAlgorithmSet(algorithmSet);
  return Object.entries(groups).map(([key, group]) => ({
    value: key,
    label: group.name,
    description: group.description
  }));
};

// Check if an algorithm belongs to a specific group
export const algorithmBelongsToGroup = (algorithm: any, groupKey: string, algorithmSet: AlgorithmSet | null): boolean => {
  const groups = getGroupsForAlgorithmSet(algorithmSet);
  const group = groups[groupKey];
  
  if (!group) {
    return false;
  }

  // Check by case numbers (for OLL primarily)
  if (group.caseNumbers && algorithm.caseNumber) {
    const belongs = group.caseNumbers.includes(algorithm.caseNumber);
    if (belongs) {
      console.log(`✓ Algorithm "${algorithm.name}" (case ${algorithm.caseNumber}) matches group "${groupKey}"`);
    }
    return belongs;
  }

  // Check by tags
  if (group.tags && algorithm.tags) {
    const belongs = group.tags.some(tag => algorithm.tags.includes(tag));
    if (belongs) {
      console.log(`✓ Algorithm "${algorithm.name}" matches group "${groupKey}" by tags`);
    }
    return belongs;
  }

  // Check by custom filter function
  if (group.filterFunction) {
    const belongs = group.filterFunction(algorithm);
    if (belongs) {
      console.log(`✓ Algorithm "${algorithm.name}" matches group "${groupKey}" by custom filter`);
    }
    return belongs;
  }

  return false;
};

// Legacy function for backward compatibility
export const getAllGroupOptions = (): Array<{ value: string; label: string; description?: string }> => {
  return getGroupOptionsForAlgorithmSet(null);
};
