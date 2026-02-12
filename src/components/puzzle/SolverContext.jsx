import React, { createContext, useState, useEffect, useCallback, useContext, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { supabase } from '@/lib/supabase-client';
import { getItem, setItem, removeItem } from '@/lib/indexedDB';

// --- Data Constants ---
const pieces = [
    {"id": 0, "edges": [0, 0, 1, 17]}, {"id": 1, "edges": [0, 0, 1, 5]}, {"id": 2, "edges": [0, 0, 9, 17]},
    {"id": 3, "edges": [0, 0, 17, 9]}, {"id": 4, "edges": [0, 1, 2, 1]}, {"id": 5, "edges": [0, 1, 10, 9]},
    {"id": 6, "edges": [0, 1, 6, 1]}, {"id": 7, "edges": [0, 1, 6, 13]}, {"id": 8, "edges": [0, 1, 11, 17]},
    {"id": 9, "edges": [0, 1, 7, 5]}, {"id": 10, "edges": [0, 1, 15, 9]}, {"id": 11, "edges": [0, 1, 8, 5]},
    {"id": 12, "edges": [0, 1, 8, 13]}, {"id": 13, "edges": [0, 1, 21, 5]}, {"id": 14, "edges": [0, 9, 10, 1]},
    {"id": 15, "edges": [0, 9, 18, 17]}, {"id": 16, "edges": [0, 9, 14, 13]}, {"id": 17, "edges": [0, 9, 19, 13]},
    {"id": 18, "edges": [0, 9, 7, 9]}, {"id": 19, "edges": [0, 9, 15, 9]}, {"id": 20, "edges": [0, 9, 4, 5]},
    {"id": 21, "edges": [0, 9, 12, 1]}, {"id": 22, "edges": [0, 9, 12, 13]}, {"id": 23, "edges": [0, 9, 20, 1]},
    {"id": 24, "edges": [0, 9, 21, 1]}, {"id": 25, "edges": [0, 17, 2, 9]}, {"id": 26, "edges": [0, 17, 2, 17]},
    {"id": 27, "edges": [0, 17, 10, 17]}, {"id": 28, "edges": [0, 17, 18, 17]}, {"id": 29, "edges": [0, 17, 7, 13]},
    {"id": 30, "edges": [0, 17, 15, 9]}, {"id": 31, "edges": [0, 17, 20, 17]}, {"id": 32, "edges": [0, 17, 8, 9]},
    {"id": 33, "edges": [0, 17, 8, 5]}, {"id": 34, "edges": [0, 17, 16, 13]}, {"id": 35, "edges": [0, 17, 22, 5]},
    {"id": 36, "edges": [0, 5, 18, 1]}, {"id": 37, "edges": [0, 5, 3, 13]}, {"id": 38, "edges": [0, 5, 11, 13]},
    {"id": 39, "edges": [0, 5, 19, 9]}, {"id": 40, "edges": [0, 5, 19, 17]}, {"id": 41, "edges": [0, 5, 15, 1]},
    {"id": 42, "edges": [0, 5, 15, 9]}, {"id": 43, "edges": [0, 5, 15, 17]}, {"id": 44, "edges": [0, 5, 4, 1]},
    {"id": 45, "edges": [0, 5, 20, 5]}, {"id": 46, "edges": [0, 5, 8, 5]}, {"id": 47, "edges": [0, 5, 16, 5]},
    {"id": 48, "edges": [0, 13, 2, 13]}, {"id": 49, "edges": [0, 13, 10, 1]}, {"id": 50, "edges": [0, 13, 10, 9]},
    {"id": 51, "edges": [0, 13, 6, 1]}, {"id": 52, "edges": [0, 13, 7, 5]}, {"id": 53, "edges": [0, 13, 4, 5]},
    {"id": 54, "edges": [0, 13, 4, 13]}, {"id": 55, "edges": [0, 13, 8, 17]}, {"id": 56, "edges": [0, 13, 16, 1]},
    {"id": 57, "edges": [0, 13, 16, 13]}, {"id": 58, "edges": [0, 13, 21, 9]}, {"id": 59, "edges": [0, 13, 22, 17]},
    {"id": 60, "edges": [2, 2, 6, 18]}, {"id": 61, "edges": [2, 2, 14, 7]}, {"id": 62, "edges": [2, 10, 10, 3]},
    {"id": 63, "edges": [2, 18, 2, 8]}, {"id": 64, "edges": [2, 18, 18, 22]}, {"id": 65, "edges": [2, 18, 14, 14]},
    {"id": 66, "edges": [2, 18, 11, 10]}, {"id": 67, "edges": [2, 18, 20, 6]}, {"id": 68, "edges": [2, 18, 22, 8]},
    {"id": 69, "edges": [2, 3, 3, 7]}, {"id": 70, "edges": [2, 3, 7, 12]}, {"id": 71, "edges": [2, 11, 14, 18]},
    {"id": 72, "edges": [2, 11, 15, 4]}, {"id": 73, "edges": [2, 11, 20, 15]}, {"id": 74, "edges": [2, 11, 8, 3]},
    {"id": 75, "edges": [2, 19, 14, 15]}, {"id": 76, "edges": [2, 19, 19, 15]}, {"id": 77, "edges": [2, 7, 3, 16]},
    {"id": 78, "edges": [2, 7, 20, 3]}, {"id": 79, "edges": [2, 7, 16, 21]}, {"id": 80, "edges": [2, 15, 19, 18]},
    {"id": 81, "edges": [2, 4, 18, 18]}, {"id": 82, "edges": [2, 4, 11, 4]}, {"id": 83, "edges": [2, 12, 18, 19]},
    {"id": 84, "edges": [2, 12, 6, 14]}, {"id": 85, "edges": [2, 12, 8, 12]}, {"id": 86, "edges": [2, 12, 16, 20]},
    {"id": 87, "edges": [2, 20, 2, 21]}, {"id": 88, "edges": [2, 20, 6, 22]}, {"id": 89, "edges": [2, 20, 4, 16]},
    {"id": 90, "edges": [2, 8, 11, 12]}, {"id": 91, "edges": [2, 8, 19, 15]}, {"id": 92, "edges": [2, 8, 19, 4]},
    {"id": 93, "edges": [2, 8, 4, 21]}, {"id": 94, "edges": [2, 8, 12, 14]}, {"id": 95, "edges": [2, 21, 21, 3]},
    {"id": 96, "edges": [2, 22, 4, 19]}, {"id": 97, "edges": [2, 22, 20, 8]}, {"id": 98, "edges": [2, 22, 21, 6]},
    {"id": 99, "edges": [2, 22, 22, 21]}, {"id": 100, "edges": [10, 10, 12, 15]}, {"id": 101, "edges": [10, 10, 12, 16]},
    {"id": 102, "edges": [10, 10, 16, 19]}, {"id": 103, "edges": [10, 10, 22, 6]}, {"id": 104, "edges": [10, 18, 4, 15]},
    {"id": 105, "edges": [10, 6, 3, 8]}, {"id": 106, "edges": [10, 6, 19, 8]}, {"id": 107, "edges": [10, 6, 4, 15]},
    {"id": 108, "edges": [10, 6, 16, 11]}, {"id": 109, "edges": [10, 14, 15, 12]},
    {"id": 110, "edges": [10, 14, 12, 15]}, {"id": 111, "edges": [10, 3, 20, 19]}, {"id": 112, "edges": [10, 3, 20, 16]},
    {"id": 113, "edges": [10, 11, 14, 4]}, {"id": 114, "edges": [10, 11, 7, 12]}, {"id": 115, "edges": [10, 11, 12, 11]},
    {"id": 116, "edges": [10, 11, 22, 16]}, {"id": 117, "edges": [10, 19, 3, 21]}, {"id": 118, "edges": [10, 7, 16, 12]},
    {"id": 119, "edges": [10, 15, 8, 22]}, {"id": 120, "edges": [10, 4, 14, 22]}, {"id": 121, "edges": [10, 20, 6, 16]},
    {"id": 122, "edges": [10, 20, 14, 19]}, {"id": 123, "edges": [10, 20, 20, 15]}, {"id": 124, "edges": [10, 8, 12, 22]},
    {"id": 125, "edges": [10, 8, 21, 15]}, {"id": 126, "edges": [10, 16, 14, 6]}, {"id": 127, "edges": [10, 16, 19, 21]},
    {"id": 128, "edges": [10, 16, 4, 3]}, {"id": 129, "edges": [10, 16, 20, 8]}, {"id": 130, "edges": [10, 21, 6, 20]},
    {"id": 131, "edges": [10, 21, 12, 14]}, {"id": 132, "edges": [10, 22, 14, 16]}, {"id": 133, "edges": [10, 22, 11, 4]},
    {"id": 134, "edges": [10, 22, 4, 3]}, {"id": 135, "edges": [10, 22, 16, 20]}, {"id": 136, "edges": [18, 18, 20, 7]},
    {"id": 137, "edges": [18, 6, 6, 3]}, {"id": 138, "edges": [18, 6, 6, 11]}, {"id": 139, "edges": [18, 6, 6, 12]},
    {"id": 140, "edges": [18, 6, 19, 21]}, {"id": 141, "edges": [18, 6, 15, 6]}, {"id": 142, "edges": [18, 6, 16, 12]},
    {"id": 143, "edges": [18, 6, 21, 21]}, {"id": 144, "edges": [18, 14, 3, 4]}, {"id": 145, "edges": [18, 3, 18, 12]},
    {"id": 146, "edges": [18, 3, 18, 22]}, {"id": 147, "edges": [18, 3, 3, 14]}, {"id": 148, "edges": [18, 3, 15, 12]},
    {"id": 149, "edges": [18, 19, 6, 11]}, {"id": 150, "edges": [18, 19, 4, 22]}, {"id": 151, "edges": [18, 7, 11, 11]},
    {"id": 152, "edges": [18, 7, 11, 19]}, {"id": 153, "edges": [18, 7, 22, 16]}, {"id": 154, "edges": [18, 4, 7, 7]},
    {"id": 155, "edges": [18, 4, 7, 12]}, {"id": 156, "edges": [18, 4, 22, 7]}, {"id": 157, "edges": [18, 20, 7, 16]},
    {"id": 158, "edges": [18, 20, 8, 6]}, {"id": 159, "edges": [18, 8, 21, 21]}, {"id": 160, "edges": [18, 16, 6, 20]},
    {"id": 161, "edges": [18, 16, 14, 20]}, {"id": 162, "edges": [18, 22, 15, 11]}, {"id": 163, "edges": [18, 22, 4, 16]},
    {"id": 164, "edges": [14, 6, 3, 4]}, {"id": 165, "edges": [6, 14, 4, 8]},
    {"id": 166, "edges": [6, 11, 3, 3]},
    {"id": 167, "edges": [6, 19, 11, 15]}, {"id": 168, "edges": [6, 19, 19, 21]}, {"id": 169, "edges": [6, 7, 4, 8]},
    {"id": 170, "edges": [6, 7, 20, 16]}, {"id": 171, "edges": [6, 7, 21, 11]}, {"id": 172, "edges": [6, 15, 15, 15]},
    {"id": 173, "edges": [6, 15, 12, 20]}, {"id": 174, "edges": [6, 4, 7, 21]}, {"id": 175, "edges": [6, 12, 7, 19]},
    {"id": 176, "edges": [6, 20, 14, 4]}, {"id": 177, "edges": [6, 8, 12, 16]}, {"id": 178, "edges": [6, 8, 8, 15]},
    {"id": 179, "edges": [6, 16, 7, 16]}, {"id": 180, "edges": [6, 21, 11, 16]}, {"id": 181, "edges": [6, 21, 7, 11]},
    {"id": 182, "edges": [14, 14, 19, 8]}, {"id": 183, "edges": [14, 3, 22, 7]}, {"id": 184, "edges": [14, 11, 19, 12]},
    {"id": 185, "edges": [14, 11, 8, 8]}, {"id": 186, "edges": [14, 19, 21, 7]}, {"id": 187, "edges": [14, 7, 14, 21]},
    {"id": 188, "edges": [14, 7, 3, 19]}, {"id": 189, "edges": [14, 7, 16, 19]}, {"id": 190, "edges": [14, 15, 3, 3]},
    {"id": 191, "edges": [14, 15, 15, 20]}, {"id": 192, "edges": [14, 4, 11, 7]}, {"id": 193, "edges": [14, 12, 21, 11]},
    {"id": 194, "edges": [14, 12, 21, 22]}, {"id": 195, "edges": [14, 12, 22, 15]}, {"id": 196, "edges": [14, 20, 11, 22]},
    {"id": 197, "edges": [14, 20, 19, 8]}, {"id": 198, "edges": [14, 20, 20, 20]}, {"id": 199, "edges": [14, 8, 19, 3]},
    {"id": 200, "edges": [14, 16, 21, 8]}, {"id": 201, "edges": [14, 16, 22, 7]}, {"id": 202, "edges": [14, 21, 12, 19]},
    {"id": 203, "edges": [14, 21, 12, 8]}, {"id": 204, "edges": [14, 21, 16, 3]}, {"id": 205, "edges": [14, 21, 22, 21]},
    {"id": 206, "edges": [3, 3, 22, 7]}, {"id": 207, "edges": [3, 11, 19, 22]}, {"id": 208, "edges": [3, 11, 8, 15]},
    {"id": 209, "edges": [3, 7, 11, 19]}, {"id": 210, "edges": [3, 7, 16, 15]}, {"id": 211, "edges": [3, 15, 3, 16]},
    {"id": 212, "edges": [3, 4, 8, 8]}, {"id": 213, "edges": [3, 12, 3, 20]}, {"id": 214, "edges": [3, 12, 4, 22]},
    {"id": 215, "edges": [3, 12, 22, 21]}, {"id": 216, "edges": [3, 20, 19, 15]}, {"id": 217, "edges": [3, 16, 4, 12]},
    {"id": 218, "edges": [3, 21, 11, 4]}, {"id": 219, "edges": [3, 22, 11, 16]}, {"id": 220, "edges": [3, 22, 21, 21]},
    {"id": 221, "edges": [3, 22, 21, 22]}, {"id": 222, "edges": [11, 11, 12, 22]}, {"id": 223, "edges": [11, 11, 20, 7]},
    {"id": 224, "edges": [11, 11, 16, 15]}, {"id": 225, "edges": [11, 7, 19, 15]}, {"id": 226, "edges": [11, 7, 12, 12]},
    {"id": 227, "edges": [11, 4, 19, 8]}, {"id": 228, "edges": [11, 20, 7, 22]}, {"id": 229, "edges": [11, 20, 16, 8]},
    {"id": 230, "edges": [11, 8, 12, 20]}, {"id": 231, "edges": [11, 8, 12, 21]}, {"id": 232, "edges": [19, 19, 19, 20]},
    {"id": 233, "edges": [19, 7, 16, 4]}, {"id": 234, "edges": [19, 4, 7, 4]}, {"id": 235, "edges": [19, 4, 7, 20]},
    {"id": 236, "edges": [19, 4, 12, 15]}, {"id": 237, "edges": [19, 12, 4, 16]}, {"id": 238, "edges": [19, 20, 15, 22]},
    {"id": 239, "edges": [19, 20, 21, 15]}, {"id": 240, "edges": [19, 8, 7, 21]}, {"id": 241, "edges": [19, 8, 4, 21]},
    {"id": 242, "edges": [7, 15, 15, 12]}, {"id": 243, "edges": [7, 15, 20, 8]}, {"id": 244, "edges": [7, 4, 22, 20]},
    {"id": 245, "edges": [7, 21, 16, 22]}, {"id": 246, "edges": [15, 15, 21, 22]}, {"id": 247, "edges": [15, 4, 12, 4]},
    {"id": 248, "edges": [15, 12, 4, 21]}, {"id": 249, "edges": [15, 20, 16, 21]}, {"id": 250, "edges": [4, 4, 22, 8]},
    {"id": 251, "edges": [4, 12, 8, 12]}, {"id": 252, "edges": [12, 8, 16, 20]}, {"id": 253, "edges": [20, 16, 21, 16]},
    {"id": 254, "edges": [20, 22, 16, 22]}, {"id": 255, "edges": [8, 22, 21, 22]}
];

const hints = {
    135: {"id": 138, "rotation": 180},
    34:  {"id": 207, "rotation": 270},
    45:  {"id": 254, "rotation": 270},
    210: {"id": 180, "rotation": 270},
    221: {"id": 248, "rotation": 0},
};

const fixed_order = [
    34, 45, 135, 210, 221, 18, 29, 33, 35, 44, 46, 50, 61, 119, 134, 136, 151, 194, 205, 209, 211, 220, 222, 226, 237, 17, 19, 28, 30, 49, 51, 60, 62, 118, 120, 150, 152, 193, 195, 204, 206, 225, 227, 236, 238, 2, 13, 32, 36, 43, 47, 66, 77, 103, 133, 137, 167, 178, 189, 208, 212, 219, 223, 242, 253, 0, 1, 3, 4, 11, 12, 14, 15, 16, 20, 27, 31, 48, 52, 59, 63, 64, 65, 67, 68, 75, 76, 78, 79, 101, 102, 104, 105, 117, 121, 149, 153, 165, 166, 168, 169, 176, 177, 179, 180, 187, 188, 190, 191, 192, 196, 203, 207, 224, 228, 235, 239, 240, 241, 243, 244, 251, 252, 254, 255, 37, 42, 82, 87, 93, 132, 138, 162, 173, 183, 213, 218, 5, 10, 21, 26, 53, 58, 69, 74, 80, 81, 83, 84, 85, 86, 88, 89, 90, 91, 92, 94, 95, 100, 106, 116, 122, 148, 154, 160, 161, 163, 164, 170, 171, 172, 174, 175, 181, 182, 184, 185, 186, 197, 202, 229, 234, 245, 250, 7, 24, 39, 56, 112, 114, 124, 126, 129, 141, 143, 215, 232, 247, 9, 22, 41, 54, 71, 97, 109, 111, 131, 139, 144, 146, 156, 158, 200, 217, 230, 249, 73, 99, 107, 198, 6, 8, 96, 127, 128, 159, 246, 248, 23, 25, 38, 40, 55, 57, 70, 72, 98, 108, 110, 113, 115, 123, 125, 130, 140, 142, 145, 147, 155, 157, 199, 201, 214, 216, 231, 233
];

const SIZE = 16;
const pieceMap = Object.fromEntries(pieces.map(p => [p.id, p]));
const directions = { north: -SIZE, east: 1, south: SIZE, west: -1 };

const hintAdjacentStatsKeys = new Array(SIZE * SIZE).fill(null);
for (let i = 0; i < SIZE * SIZE; i++) {
    hintAdjacentStatsKeys[i] = i.toString();
}
Object.keys(hints).forEach(hintPosStr => {
    const hintPos = parseInt(hintPosStr);
    Object.entries(directions).forEach(([dirName, offset]) => {
        const adjPos = hintPos + offset;
        const row = Math.floor(adjPos / SIZE);
        const col = adjPos % SIZE;
        if (adjPos >= 0 && adjPos < SIZE * SIZE &&
            !(offset === directions.east && col === 0) &&
            !(offset === directions.west && col === SIZE - 1))
        {
            hintAdjacentStatsKeys[adjPos] = `${hintPos}-${dirName}`;
        }
    });
});

// --- OPTIMIZATION: Precompute Rotations ---
// Avoids creating new arrays/objects during the hot loop
// Also build a Lookup Table for fast candidate selection
const PRECOMPUTED_PIECES = new Array(256).fill(null);
const PIECE_LOOKUP = Array.from({ length: 23 }, () => [[], [], [], []]); // [color][direction] -> [rotData...]
const ALL_ROTATIONS = [];

pieces.forEach(p => {
    const rotations = [0, 90, 180, 270].map(rot => {
        const steps = Math.round(rot / 90) % 4;
        const edges = steps === 0 
            ? [...p.edges] 
            : [...p.edges.slice(4 - steps), ...p.edges.slice(0, 4 - steps)];
        return { piece: p, edges, rotation: rot, attemptKey: `${p.id}-${rot}` };
    });

    PRECOMPUTED_PIECES[p.id] = {
        id: p.id,
        rotations: rotations
    };

    rotations.forEach(rotData => {
        ALL_ROTATIONS.push(rotData);
        // Index by edge color for each direction: 0=N, 1=E, 2=S, 3=W
        PIECE_LOOKUP[rotData.edges[0]][0].push(rotData);
        PIECE_LOOKUP[rotData.edges[1]][1].push(rotData);
        PIECE_LOOKUP[rotData.edges[2]][2].push(rotData);
        PIECE_LOOKUP[rotData.edges[3]][3].push(rotData);
    });
});

const SolverContext = createContext();
export const useSolver = () => useContext(SolverContext);

const analyzeFailure = (board, used, pos) => {
    const row = Math.floor(pos / SIZE);
    const col = pos % SIZE;
    let reqTop = -1, reqRight = -1, reqBottom = -1, reqLeft = -1;

    // Border constraints
    if (row === 0) reqTop = 0;
    if (row === SIZE - 1) reqBottom = 0;
    if (col === 0) reqLeft = 0;
    if (col === SIZE - 1) reqRight = 0;

    // Neighbor constraints
    if (row > 0) { const n = board[pos - SIZE]; if (n) reqTop = n.edges[2]; }
    if (col < SIZE - 1) { const n = board[pos + 1]; if (n) reqRight = n.edges[3]; }
    if (row < SIZE - 1) { const n = board[pos + SIZE]; if (n) reqBottom = n.edges[0]; }
    if (col > 0) { const n = board[pos - 1]; if (n) reqLeft = n.edges[1]; }

    let possiblePieces = 0;
    let availablePieces = 0;
    
    for (let id = 0; id < 256; id++) {
         const precomputed = PRECOMPUTED_PIECES[id];
         for (const rotData of precomputed.rotations) {
             if (reqTop !== -1) { if (rotData.edges[0] !== reqTop) continue; }
             else if (rotData.edges[0] === 0) continue;
             
             if (reqRight !== -1) { if (rotData.edges[1] !== reqRight) continue; }
             else if (rotData.edges[1] === 0) continue;

             if (reqBottom !== -1) { if (rotData.edges[2] !== reqBottom) continue; }
             else if (rotData.edges[2] === 0) continue;

             if (reqLeft !== -1) { if (rotData.edges[3] !== reqLeft) continue; }
             else if (rotData.edges[3] === 0) continue;

             possiblePieces++;
             if (used[id] === 0) availablePieces++;
         }
    }
    return { possiblePieces, availablePieces, constraints: { 
        t: reqTop === -1 ? '*' : reqTop, 
        r: reqRight === -1 ? '*' : reqRight, 
        b: reqBottom === -1 ? '*' : reqBottom, 
        l: reqLeft === -1 ? '*' : reqLeft 
    } };
};

export const SolverProvider = ({ children }) => {
  const [board, setBoard] = useState(Array(SIZE * SIZE).fill(null));
  const [isRunning, setIsRunning] = useState(false);
  const [onlineCount, setOnlineCount] = useState(0); 
  
  // Initialize with defaults, load from DB in useEffect
  const [currentRun, setCurrentRun] = useState({ run: 0, score: 0 });
  const [stats, setStats] = useState({ totalRuns: 0, bestScore: 0, avgScore: 0, completedSolutions: 0 });
  const [hintAdjacencyStats, setHintAdjacencyStats] = useState({});
  const [globalScoreDistribution, setGlobalScoreDistribution] = useState({});
  const [placementAttemptCounts, setPlacementAttemptCounts] = useState({});
  const [solutions, setSolutions] = useState([]);
  const [failCounts, setFailCounts] = useState({});
  
  const [recentStats, setRecentStats] = useState({ avg: 0, min: 0, max: 0, history: [] });
  const recentScoresBufferRef = useRef(new Uint16Array(1000));
  const recentScoresIndexRef = useRef(0);
  const recentScoresSumRef = useRef(0);
  const recentScoresCountRef = useRef(0);
  const [showBarrierMap, setShowBarrierMap] = useState(false);
  const [validationStatus, setValidationStatus] = useState(null);
  const [bestBoards, setBestBoards] = useState([]);
  const [actualIps, setActualIps] = useState(0);
  const runsLastSecondRef = useRef(0);
  const lastIpsUpdateRef = useRef(Date.now());
  
  // PERFORMANCE: Use Refs for high-frequency data accumulation to avoid React render cycle overhead in the hot loop
  const hintAdjacencyStatsRef = useRef(hintAdjacencyStats);
  const globalScoreDistributionRef = useRef(globalScoreDistribution);
  const placementAttemptCountsRef = useRef(placementAttemptCounts);
  const failCountsRef = useRef(failCounts);
  
  // PERFORMANCE: Mutable buffers for the solver loop to avoid Garbage Collection
  const workingBoardRef = useRef(Array(SIZE * SIZE).fill(null));
  const usedPiecesRef = useRef(new Uint8Array(256)); // 0 = unused, 1 = used
  const currentRunRef = useRef(currentRun);
  const statsRef = useRef(stats);
  const failCountsBufferRef = useRef(new Uint32Array(256)); // Fast counter for current batch
  const weightsBufferRef = useRef(new Float32Array(1024));

  const hasLoggedSaveErrorRef = useRef(false);
  const [mlParams, setMlParams] = useState({
    useCalibration: true,
    boardUpdateFrequency: 2000,
    iterationsPerSecond: 10000,
    turboMode: false
  });

  const pendingGlobalRunsRef = useRef(0);
  const globalStatsIdRef = useRef(null);

  // --- Validation: Check fixed_order integrity on mount ---
  useEffect(() => {
    const uniquePositions = new Set(fixed_order);
    const missingPositions = [];
    for (let i = 0; i < SIZE * SIZE; i++) {
      if (!uniquePositions.has(i)) missingPositions.push(i);
    }
    
    if (missingPositions.length > 0) {
      console.error(`[Solver] CRITICAL: fixed_order is missing ${missingPositions.length} positions!`, missingPositions);
      setValidationStatus({ valid: false, message: `Error: Missing ${missingPositions.length} positions` });
    } else {
      // console.log(`[Solver] fixed_order validated: All ${uniquePositions.size} positions present.`);
      setValidationStatus({ valid: true, message: "Logic Validated" });
    }
  }, []);

  // --- 1. Real-time Presence Logic (Fixes "0 Online") ---
  useEffect(() => {
    // Join without custom key so Supabase assigns unique UUID per user
    const channel = supabase.channel('online-users');

    channel
      .on('presence', { event: 'sync' }, () => {
        const newState = channel.presenceState();
        // Count unique keys in the presence state
        setOnlineCount(Object.keys(newState).length);
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await channel.track({ online_at: new Date().toISOString() });
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // --- 1b. Load State from IndexedDB (with LocalStorage migration) ---
  useEffect(() => {
    const loadData = async () => {
        const loadKey = async (key, setter, ref, defaultVal) => {
            let val = await getItem(key);
            
            // Migration: If not in DB, check LocalStorage
            if (!val) {
                try {
                    const local = window.localStorage.getItem(key);
                    if (local) {
                        val = JSON.parse(local);
                        // Save to DB immediately to complete migration
                        await setItem(key, val);
                        // Optional: Clear local storage to free up space
                        window.localStorage.removeItem(key);
                    }
                } catch (e) {
                    console.warn(`Migration failed for ${key}`, e);
                }
            }

            const finalVal = val || defaultVal;
            setter(finalVal);
            if (ref) ref.current = finalVal;
            return finalVal;
        };

        await loadKey('solver-currentRun', setCurrentRun, currentRunRef, { run: 0, score: 0 });
        await loadKey('solver-stats', setStats, statsRef, { totalRuns: 0, bestScore: 0, avgScore: 0, completedSolutions: 0 });
        await loadKey('solver-hintAdjacencyStats', setHintAdjacencyStats, hintAdjacencyStatsRef, {});
        await loadKey('solver-globalScoreDistribution', setGlobalScoreDistribution, globalScoreDistributionRef, {});
        await loadKey('solver-placementAttemptCounts', setPlacementAttemptCounts, placementAttemptCountsRef, {});
        await loadKey('solver-failCounts', setFailCounts, failCountsRef, {});
        await loadKey('solver-solutions', setSolutions, null, []);
        await loadKey('solver-mlParams', setMlParams, null, { 
            useCalibration: true, 
            boardUpdateFrequency: 2000, 
            iterationsPerSecond: 10000, 
            turboMode: false 
        });

        // Special handling for bestBoards (filtering)
        let bb = await getItem('solver-bestBoards');
        if (!bb) {
            const local = window.localStorage.getItem('solver-bestBoards');
            if (local) bb = JSON.parse(local);
        }
        if (Array.isArray(bb) && bb.length > 0) {
            const scores = bb.map(b => b.filter(p => p).length);
            const maxScore = Math.max(...scores);
            const filtered = bb.filter((_, i) => scores[i] === maxScore);
            setBestBoards(filtered);
        }
    };
    loadData();
  }, []);

  // --- 2. Persist Local State (Interval) ---
  // FIX: Use an interval to save Refs directly. The previous debounced useEffect 
  // would reset constantly during high-speed runs and never actually save until stopped.
  useEffect(() => {
    const saveInterval = setInterval(() => {
      try {
        // Use setItem from IndexedDB (async, no JSON.stringify needed for objects)
        setItem('solver-currentRun', currentRunRef.current);
        setItem('solver-stats', statsRef.current);
        setItem('solver-hintAdjacencyStats', hintAdjacencyStatsRef.current);
        setItem('solver-globalScoreDistribution', globalScoreDistributionRef.current);
        setItem('solver-placementAttemptCounts', placementAttemptCountsRef.current);
        setItem('solver-mlParams', mlParams);
        setItem('solver-failCounts', failCountsRef.current);
        hasLoggedSaveErrorRef.current = false; // Reset flag on success
      } catch (e) {
        if (!hasLoggedSaveErrorRef.current) {
            console.warn("Failed to save solver state (likely quota exceeded). Suppressing further errors.", e);
            hasLoggedSaveErrorRef.current = true;
        }
      }
    }, 5000); // Save every 5 seconds (Optimized for larger IndexedDB payloads)
    return () => clearInterval(saveInterval);
  }, [mlParams]); // mlParams dependency ensures we save latest config if it changes

  // --- 2b. Persist Solutions (Separate Effect) ---
  useEffect(() => {
      setItem('solver-solutions', solutions);
  }, [solutions]);

  // --- 2c. Persist Best Boards ---
  useEffect(() => {
      if (bestBoards && bestBoards.length > 0) {
          setItem('solver-bestBoards', bestBoards);
      }
  }, [bestBoards]);

  // --- 2d. Sync Stats with Best Boards (Safety Net) ---
  useEffect(() => {
      if (bestBoards.length > 0) {
          const currentBestBoardScore = bestBoards[0].filter(p => p).length;
          if (currentBestBoardScore > stats.bestScore) {
              setStats(prev => ({ ...prev, bestScore: currentBestBoardScore }));
              statsRef.current.bestScore = currentBestBoardScore;
          }
      }
  }, [bestBoards, stats.bestScore]);

  // --- 3. Dynamic Global Stats Sync (Fixes "Total Global Runs") ---
  useEffect(() => {
    // A. Fetch the correct Row ID once on mount
    const fetchStatId = async () => {
      const { data } = await supabase
        .from('global_stats')
        .select('id')
        .eq('stat_name', 'total_global_runs')
        .single();
      if (data) {
        globalStatsIdRef.current = data.id;
      }
    };
    fetchStatId();
  }, []);

  useEffect(() => {
    // B. Sync interval using the fetched ID
    const interval = setInterval(async () => {
      if (pendingGlobalRunsRef.current > 0 && globalStatsIdRef.current) {
        const runsToAdd = pendingGlobalRunsRef.current;
        pendingGlobalRunsRef.current = 0;
        
        try {
          await supabase.rpc('increment_global_runs', { 
            row_id: globalStatsIdRef.current, 
            inc_value: runsToAdd 
          });
        } catch (error) {
          console.error('Failed to update global runs:', error);
          pendingGlobalRunsRef.current += runsToAdd;
        }
      }
    }, 10000); 
    
    return () => clearInterval(interval);
  }, []);

  const runBatch = useCallback(() => {
    try {
    // Determine batch size based on target FPS (e.g., 60fps)
    // If we want 10,000 runs/sec, we need ~166 runs per 16ms tick.
    const ips = mlParams.iterationsPerSecond || 10000;
    const batchSize = Math.max(1, Math.ceil(ips / 60));
    
    let solutionFound = false;
    let triggerBoardUpdate = false;
    let batchBestBoards = [];
    let newHighScoreReached = false;
    let runsInBatch = 0;
    const validPlacementsBuffer = []; // Hoist allocation out of the loop
    const batchFailCounts = failCountsBufferRef.current;
    let firstFailure = true;
    
    for (let i = 0; i < batchSize; i++) {
        const shouldStop = runSingleSimulation();
        runsInBatch++;
        if (shouldStop) break;
    }

    function runSingleSimulation() {
    const newBoard = workingBoardRef.current;
    newBoard.fill(null); // Reset buffer
    
    const used = usedPiecesRef.current;
    used.fill(0); // Reset used flags
    firstFailure = true; // Reset failure tracker for this simulation

    for (const [posStr, hint] of Object.entries(hints)) {
        const pos = parseInt(posStr);
        const piece = pieceMap[hint.id];
        if (piece) {
            newBoard[pos] = {
                id: piece.id,
                edges: PRECOMPUTED_PIECES[piece.id].rotations.find(r => r.rotation === hint.rotation).edges,
                rotation: hint.rotation,
                isHint: true,
            };
            used[piece.id] = 1;
        }
    }
    
    for (const pos of fixed_order) {
      if (newBoard[pos] !== null) continue;
      
      validPlacementsBuffer.length = 0; // Reset buffer

      // OPTIMIZATION: Use Lookup Table to find candidates instead of iterating all 256 pieces
      const row = Math.floor(pos / SIZE);
      const col = pos % SIZE;

      // Determine constraints for this position
      // -1 means "no specific color constraint" (but still might need to be non-zero)
      let reqTop = -1, reqRight = -1, reqBottom = -1, reqLeft = -1;

      // 1. Border Constraints
      if (row === 0) reqTop = 0;
      if (row === SIZE - 1) reqBottom = 0;
      if (col === 0) reqLeft = 0;
      if (col === SIZE - 1) reqRight = 0;

      // 2. Neighbor Constraints (override/augment border checks)
      if (row > 0) {
          const n = newBoard[pos - SIZE]; // North
          if (n) reqTop = n.edges[2]; // Match North's Bottom
      }
      if (col < SIZE - 1) {
          const n = newBoard[pos + 1]; // East
          if (n) reqRight = n.edges[3]; // Match East's Left
      }
      if (row < SIZE - 1) {
          const n = newBoard[pos + SIZE]; // South
          if (n) reqBottom = n.edges[0]; // Match South's Top
      }
      if (col > 0) {
          const n = newBoard[pos - 1]; // West
          if (n) reqLeft = n.edges[1]; // Match West's Right
      }

      // 3. Select Candidate Source
      // Pick the most restrictive constraint to iterate over
      let candidates = ALL_ROTATIONS;
      if (reqTop !== -1) candidates = PIECE_LOOKUP[reqTop][0];
      else if (reqLeft !== -1) candidates = PIECE_LOOKUP[reqLeft][3];
      else if (reqRight !== -1) candidates = PIECE_LOOKUP[reqRight][1];
      else if (reqBottom !== -1) candidates = PIECE_LOOKUP[reqBottom][2];

      // 4. Filter Candidates
      for (const rotData of candidates) {
          if (used[rotData.piece.id] === 1) continue;

          // Check against all constraints
          // Note: We check !== -1 to see if a constraint exists. 
          // If constraint is 0 (border), edges must be 0. 
          // If constraint is > 0 (neighbor), edges must match.
          // If constraint is -1 (internal/unknown), edges must NOT be 0 (internal edges are never flat).
          
          if (reqTop !== -1) { if (rotData.edges[0] !== reqTop) continue; } 
          else if (rotData.edges[0] === 0) continue; // Internal edge cannot be flat

          if (reqRight !== -1) { if (rotData.edges[1] !== reqRight) continue; }
          else if (rotData.edges[1] === 0) continue;

          if (reqBottom !== -1) { if (rotData.edges[2] !== reqBottom) continue; }
          else if (rotData.edges[2] === 0) continue;

          if (reqLeft !== -1) { if (rotData.edges[3] !== reqLeft) continue; }
          else if (rotData.edges[3] === 0) continue;

          validPlacementsBuffer.push(rotData);
      }

      if (validPlacementsBuffer.length > 0) {
          let chosenPlacement;

          const isCalibrationMode = mlParams.useCalibration;
          const isMlActive = !mlParams.useCalibration;
          const statsKey = hintAdjacentStatsKeys[pos];
          
          // Only use expensive calibration (fairness) for hint-adjacent positions (legacy keys)
          // For the rest of the board, random selection is sufficient for data collection.
          if (statsKey && isCalibrationMode && statsKey.includes('-')) {
              let minAttempts = Infinity;
              const currentCounts = placementAttemptCountsRef.current;
              const countsObj = currentCounts[statsKey] || {};

              // Pass 1: Find min attempts (Zero allocation)
              for (let i = 0; i < validPlacementsBuffer.length; i++) {
                  const p = validPlacementsBuffer[i];
                  const attemptKey = p.attemptKey;
                  const attempts = countsObj[attemptKey] || 0;
                  if (attempts < minAttempts) minAttempts = attempts;
              }

              // Pass 2: Reservoir sampling to pick one of the min attempts (Zero allocation)
              let count = 0;
              for (let i = 0; i < validPlacementsBuffer.length; i++) {
                  const p = validPlacementsBuffer[i];
                  const attemptKey = p.attemptKey;
                  const attempts = countsObj[attemptKey] || 0;
                  if (attempts === minAttempts) {
                      count++;
                      if (Math.random() < 1/count) chosenPlacement = p;
                  }
              }
              
              // Update counts
              if (!currentCounts[statsKey]) currentCounts[statsKey] = {};
              const chosenKey = chosenPlacement.attemptKey;
              currentCounts[statsKey][chosenKey] = (currentCounts[statsKey][chosenKey] || 0) + 1;

          } else if (statsKey && isMlActive) { 
              const currentStats = hintAdjacencyStatsRef.current;
              const pieceStats = currentStats[statsKey];
              
              // OPTIMIZATION: If no stats exist for this position yet, skip expensive weighting
              if (!pieceStats) {
                  chosenPlacement = validPlacementsBuffer[Math.floor(Math.random() * validPlacementsBuffer.length)];
              } else {
                  let totalWeight = 0;
                  const weights = weightsBufferRef.current;
                  let minWeight = Infinity;

                  // Pass 1: Calculate raw weights and find minimum
                  for (let i = 0; i < validPlacementsBuffer.length; i++) {
                      const p = validPlacementsBuffer[i];
                      let rawVal = 0;
                      if (pieceStats?.[p.piece.id]?.[p.rotation]) {
                          rawVal = pieceStats[p.piece.id][p.rotation].weighted_avg_contribution || 0;
                      }
                      weights[i] = rawVal;
                      if (rawVal < minWeight) minWeight = rawVal;
                  }

                  // Pass 2: Normalize weights to be positive and sum them
                  // We shift everything so the worst piece has a small positive weight (epsilon)
                  const epsilon = 1.0; 
                  const offset = (minWeight < 0) ? Math.abs(minWeight) + epsilon : epsilon;

                  for (let i = 0; i < validPlacementsBuffer.length; i++) {
                      const weight = weights[i] + offset;
                      weights[i] = weight; // Store normalized weight
                      totalWeight += weight;
                  }

                  // Pass 3: Weighted random selection
                  let randomChoice = Math.random() * totalWeight;
                  for (let i = 0; i < validPlacementsBuffer.length; i++) {
                      randomChoice -= weights[i];
                      if (randomChoice <= 0) {
                          chosenPlacement = validPlacementsBuffer[i];
                          break;
                      }
                  }
                  if (!chosenPlacement) chosenPlacement = validPlacementsBuffer[validPlacementsBuffer.length - 1];
              }
          
          } else {
            chosenPlacement = validPlacementsBuffer[Math.floor(Math.random() * validPlacementsBuffer.length)];
          }
          
          newBoard[pos] = {
              id: chosenPlacement.piece.id,
              edges: chosenPlacement.edges,
              rotation: chosenPlacement.rotation,
          };
          
          used[chosenPlacement.piece.id] = 1;
      } else {
          // No valid placements found for this position.
          // Only record the FIRST failure in the chain to visualize the "Barrier".
          if (firstFailure) {
              batchFailCounts[pos]++;
              firstFailure = false;
          }
      }
    }
    
    const score = newBoard.filter(p => p !== null).length;
    const currentRunVal = currentRunRef.current;
    const statsVal = statsRef.current;
    const currentBest = statsVal.bestScore || 0;

    const newRunCount = (currentRunVal.run || 0) + 1;
    let stopBatch = false;
    
    // FIX: Check for solution, new best score, or update frequency
    if (score === SIZE * SIZE) {
        solutionFound = true;
        triggerBoardUpdate = true;
        stopBatch = true;
    } else if (score > currentBest) {
        // Found a new best score! Reset collection and snapshot.
        
        // DEBUG: Analyze why we stopped here
        for (const pos of fixed_order) {
            if (newBoard[pos] === null) {
                const analysis = analyzeFailure(newBoard, used, pos);
                console.log(`[Analysis] New Best ${score}. First failure at ${pos}. Constraints:`, analysis.constraints);
                console.log(`[Analysis] Pieces fitting constraints: ${analysis.possiblePieces} total, ${analysis.availablePieces} available.`);
                break;
            }
        }

        newHighScoreReached = true;
        batchBestBoards = [[...newBoard]];
        triggerBoardUpdate = true;
    } else if (score === currentBest && score > 0) {
        // Found another board with the current best score. Collect it.
        batchBestBoards.push([...newBoard]);
        triggerBoardUpdate = true;
    } else if (newRunCount % mlParams.boardUpdateFrequency === 0) {
        triggerBoardUpdate = true;
    }
    
    // Ensure numbers are treated as numbers to avoid string concatenation bugs.
    // Also handle NaN if stats are corrupted.
    const currentTotalRuns = parseInt(statsVal.totalRuns) || 0;
    const currentAvgScore = parseFloat(statsVal.avgScore) || 0;
    const newTotalRuns = currentTotalRuns + 1;
    const newAvgScore = ((currentAvgScore * currentTotalRuns) + score) / newTotalRuns;

    // Update Recent Stats (Last 1000 Runs)
    const rIdx = recentScoresIndexRef.current;
    if (recentScoresCountRef.current < 1000) {
        recentScoresSumRef.current += score;
        recentScoresCountRef.current++;
    } else {
        recentScoresSumRef.current = recentScoresSumRef.current - recentScoresBufferRef.current[rIdx] + score;
    }
    recentScoresBufferRef.current[rIdx] = score;
    recentScoresIndexRef.current = (rIdx + 1) % 1000;
    
    // Update Refs
    currentRunRef.current = { run: newRunCount, score };
    statsRef.current = {
        totalRuns: newTotalRuns,
        bestScore: Math.max(statsVal.bestScore || 0, score),
        avgScore: newAvgScore,
        completedSolutions: (statsVal.completedSolutions || 0) + (solutionFound ? 1 : 0)
    };

    pendingGlobalRunsRef.current += 1;

    // --- OPTIMIZED STATS UPDATE (Direct Mutation of Refs) ---
    const currentGlobalDist = globalScoreDistributionRef.current;
    currentGlobalDist[score] = (currentGlobalDist[score] || 0) + 1;

    let total_reliable_runs = 0;
    let sum_reliable_scores = 0;
    
    // Calculate average from all data, not just >1000, to ensure we have a baseline
    for (const [scoreStr, count] of Object.entries(currentGlobalDist)) {
      // Lower threshold to 1 to include all runs, or keep a small buffer like 10
      if (count >= 1) { 
        const scoreValue = parseInt(scoreStr);
        total_reliable_runs += count;
        sum_reliable_scores += scoreValue * count;
      }
    }
    
    const average_reliable_score = total_reliable_runs > 0 
      ? sum_reliable_scores / total_reliable_runs 
      : 0;
    
    let weighted_value = 0;
    
    // FIX: Allow learning from rare high scores. 
    // If a score is rare (low count), rarity_multiplier is high.
    // We clamp the multiplier to avoid explosion on the very first run.
    const scoreCount = currentGlobalDist[score] || 1;
    const rarity_multiplier = Math.max(1, total_reliable_runs / scoreCount);
    
    // Only apply positive reinforcement if score is above average
    // Or apply negative if below.
    weighted_value = (score - average_reliable_score) * rarity_multiplier;

    const newStats = hintAdjacencyStatsRef.current; // Mutate Ref
    
    // Update stats for all placed pieces
    for (let pos = 0; pos < SIZE * SIZE; pos++) {
        const key = hintAdjacentStatsKeys[pos];
        const piece = newBoard[pos];
        
        if (key && piece && !piece.isHint) {
            const { id: pieceId, rotation } = piece;
            
            if (!newStats[key]) newStats[key] = {};
            if (!newStats[key][pieceId]) newStats[key][pieceId] = {};
            if (!newStats[key][pieceId][rotation]) {
                newStats[key][pieceId][rotation] = { 
                    weighted_sum_of_scores: 0,
                    count: 0, 
                    scoreDistribution: {}
                };
            }
            
            const currentPieceStats = newStats[key][pieceId][rotation];
            currentPieceStats.count += 1;
            
            // Always update weighted sum
            currentPieceStats.weighted_sum_of_scores += weighted_value;
            currentPieceStats.weighted_avg_contribution = currentPieceStats.weighted_sum_of_scores / currentPieceStats.count;
            
            if (!currentPieceStats.scoreDistribution) {
                currentPieceStats.scoreDistribution = {};
            }
            const scoreKey = score.toString();
            currentPieceStats.scoreDistribution[scoreKey] = (currentPieceStats.scoreDistribution[scoreKey] || 0) + 1;
        }
    }

    return stopBatch;
    } // End runSingleSimulation

    // Sync Refs to State for UI (once per batch)
    setCurrentRun({...currentRunRef.current});
    setStats({...statsRef.current});

    if (solutionFound) {
        setIsRunning(false);
        setBoard(batchBestBoard);
        setSolutions(prev => {
            // Simple check to avoid duplicates if the exact same board is found
            const newSolStr = JSON.stringify(batchBestBoard.map(p => p.id));
            if (prev.some(s => JSON.stringify(s.board.map(p => p.id)) === newSolStr)) return prev;
            return [...prev, { 
                run: currentRunRef.current.run, 
                date: new Date().toISOString(), 
                board: batchBestBoard 
            }];
        });
    } else if (batchBestBoards.length > 0) {
        // Prioritize showing the latest best score found in this batch
        setBoard(batchBestBoards[batchBestBoards.length - 1]);
        
        setBestBoards(prev => {
            if (newHighScoreReached) {
                return batchBestBoards;
            }
            
            // Filter out any previous boards that have a lower score than what we just found.
            // This handles cases where statsRef was out of sync with bestBoards (e.g. after import).
            const batchScore = batchBestBoards[0].filter(p => p).length;
            const validPrev = prev.filter(b => b.filter(p => p).length >= batchScore);

            // Append to existing best boards, maybe limit to 50 to prevent memory issues
            return [...validPrev, ...batchBestBoards].slice(-50);
        });
        setHintAdjacencyStats({...hintAdjacencyStatsRef.current});
        setFailCounts({...failCountsRef.current}); // Sync fail counts on high score
        setGlobalScoreDistribution({...globalScoreDistributionRef.current});
        setPlacementAttemptCounts({...placementAttemptCountsRef.current});
    } else if (triggerBoardUpdate) {
        if (!mlParams.turboMode) {
            setBoard([...workingBoardRef.current]);
        }

        setHintAdjacencyStats({...hintAdjacencyStatsRef.current});
        setGlobalScoreDistribution({...globalScoreDistributionRef.current});
        setPlacementAttemptCounts({...placementAttemptCountsRef.current});
    }

    // --- Track Actual IPS ---
    runsLastSecondRef.current += runsInBatch;
    const now = Date.now();
    if (now - lastIpsUpdateRef.current >= 1000) {
        setActualIps(Math.round(runsLastSecondRef.current * 1000 / (now - lastIpsUpdateRef.current)));
        runsLastSecondRef.current = 0;
        lastIpsUpdateRef.current = now;

        // Sync fail counts from buffer to ref/state once per second to avoid UI thrashing
        const currentFailCounts = failCountsRef.current;
        let hasFailUpdates = false;
        for(let i=0; i<256; i++) {
            if (batchFailCounts[i] > 0) {
                currentFailCounts[i] = (currentFailCounts[i] || 0) + batchFailCounts[i];
                batchFailCounts[i] = 0; // Reset buffer
                hasFailUpdates = true;
            }
        }
        if (hasFailUpdates) setFailCounts({...currentFailCounts});
        
        // Update Recent Average State
        const count = recentScoresCountRef.current;
        if (count > 0) {
            // Calculate Min/Max of the active buffer
            let min = Infinity;
            let max = -Infinity;
            // Only iterate up to 'count' (max 1000)
            const limit = Math.min(count, 1000);
            for(let i = 0; i < limit; i++) {
                const val = recentScoresBufferRef.current[i];
                if (val < min) min = val;
                if (val > max) max = val;
            }

            // Extract last 50 points for sparkline (handling circular buffer wrap)
            const history = [];
            let idx = recentScoresIndexRef.current - 1;
            if (idx < 0) idx = 999;
            
            for(let i = 0; i < 50 && i < count; i++) {
                history.unshift(recentScoresBufferRef.current[idx]);
                idx = (idx - 1 + 1000) % 1000;
            }

            setRecentStats({
                avg: recentScoresSumRef.current / count,
                min,
                max,
                history
            });
        }
    }
    } catch (e) {
        console.error('[Solver] Error in runBatch:', e);
        setIsRunning(false);
    }

  }, [mlParams]);
  
  useEffect(() => {
    let interval;
    if (isRunning) {
      // Run at 60 FPS (approx 16ms), but process multiple runs per tick inside runBatch
      interval = setInterval(runBatch, 16);
    }
    return () => clearInterval(interval);
  }, [isRunning, runBatch]);
  
  const handleStart = () => setIsRunning(true);
  const handlePause = () => setIsRunning(false);
  const handleReset = () => {
    setIsRunning(false);
    setBoard(Array(SIZE * SIZE).fill(null));
    const initialRunState = { run: 0, score: 0 };
    const initialStatsState = { totalRuns: 0, bestScore: 0, avgScore: 0, completedSolutions: 0 };
    const initialHintState = {};
    const initialGlobalDist = {};
    const initialAttemptCounts = {};
    const initialMlParams = { 
      useCalibration: true, 
      boardUpdateFrequency: 2000,
      iterationsPerSecond: 10000,
      turboMode: false
    };
    
    setCurrentRun(initialRunState);
    setStats(initialStatsState);
    setHintAdjacencyStats(initialHintState);
    setGlobalScoreDistribution(initialGlobalDist);
    setPlacementAttemptCounts(initialAttemptCounts);
    setMlParams(initialMlParams);
    setBestBoards([]);
    setFailCounts({});
    
    // Reset Refs
    currentRunRef.current = initialRunState;
    statsRef.current = initialStatsState;
    hintAdjacencyStatsRef.current = initialHintState;
    globalScoreDistributionRef.current = initialGlobalDist;
    placementAttemptCountsRef.current = initialAttemptCounts;
    failCountsRef.current = {};
    failCountsBufferRef.current.fill(0);
    recentScoresBufferRef.current.fill(0);
    recentScoresIndexRef.current = 0;
    recentScoresSumRef.current = 0;
    recentScoresCountRef.current = 0;
    setRecentStats({ avg: 0, min: 0, max: 0, history: [] });
    
    removeItem('solver-currentRun');
    removeItem('solver-stats');
    removeItem('solver-hintAdjacencyStats');
    removeItem('solver-globalScoreDistribution');
    removeItem('solver-placementAttemptCounts');
    removeItem('solver-mlParams');
    removeItem('solver-bestBoards');
    removeItem('solver-failCounts');
  };

  const handleKick = () => {
      // "Kick" the solver by reducing confidence in current learned paths
      // This forces it to re-explore alternatives while keeping some knowledge
      const currentStats = hintAdjacencyStatsRef.current;
      Object.values(currentStats).forEach(pieceStats => {
          Object.values(pieceStats).forEach(rotStats => {
              Object.values(rotStats).forEach(stat => {
                  if (stat.count) stat.count = Math.floor(stat.count * 0.5);
                  if (stat.weighted_sum_of_scores) stat.weighted_sum_of_scores *= 0.5;
              });
          });
      });
      setHintAdjacencyStats({...currentStats});
  };

  const loadBackupData = (data) => {
      if(data && data.solverState && data.hintAdjacencyStats) {
          const loadedStats = data.solverState.stats || {};
          const newStats = {
              totalRuns: parseInt(loadedStats.totalRuns) || 0,
              bestScore: parseInt(loadedStats.bestScore) || 0,
              avgScore: parseFloat(loadedStats.avgScore) || 0,
              completedSolutions: parseInt(loadedStats.completedSolutions) || 0
          };
          setStats(newStats);
          setHintAdjacencyStats(data.hintAdjacencyStats || {});
          setGlobalScoreDistribution(data.globalScoreDistribution || {});
          setPlacementAttemptCounts(data.placementAttemptCounts || {});
          setFailCounts(data.failCounts || {});
          setMlParams(data.solverState.mlParams || { 
            useCalibration: true, 
            boardUpdateFrequency: 2000,
            iterationsPerSecond: 10000,
            turboMode: false
          });
          // Sync Refs
          hintAdjacencyStatsRef.current = data.hintAdjacencyStats || {};
          globalScoreDistributionRef.current = data.globalScoreDistribution || {};
          placementAttemptCountsRef.current = data.placementAttemptCounts || {};
          failCountsRef.current = data.failCounts || {};
          currentRunRef.current = data.solverState.currentRun || { run: 0, score: 0 };
          statsRef.current = newStats;
                    
          setBestBoards([]); // Clear best boards to prevent mismatch with new stats
          setBoard(Array(SIZE * SIZE).fill(null));
      } else {
          console.error("Invalid backup file format");
          alert("Could not load data. The file format is invalid.");
      }
  };

  const getSelectionPercentages = useCallback((hintPos, direction) => {
    const key = `${hintPos}-${direction}`;
    if (!hintAdjacencyStats[key]) {
      return {};
    }

    const pieceStats = hintAdjacencyStats[key];
    const isMlActive = !mlParams.useCalibration;
    const values = {};
    let totalValue = 0;
    let minValue = Infinity;

    // First pass: get raw values and find min
    for (const pieceId in pieceStats) {
      values[pieceId] = {};
      for (const rotation in pieceStats[pieceId]) {
        const stat = pieceStats[pieceId][rotation];
        const value = isMlActive
          ? stat.weighted_avg_contribution || 0
          : stat.count || 0;

        if (value < minValue) {
          minValue = value;
        }
        values[pieceId][rotation] = value;
      }
    }

    // Second pass: normalize and sum
    const offset = isMlActive ? (minValue < 0 ? Math.abs(minValue) + 1.0 : 1.0) : 0;
    for (const pieceId in values) {
      for (const rotation in values[pieceId]) {
        const normalizedValue = values[pieceId][rotation] + offset;
        values[pieceId][rotation] = normalizedValue;
        totalValue += normalizedValue;
      }
    }

    if (totalValue === 0) return {};

    // Final pass: calculate percentages
    const percentages = {};
    for (const pieceId in values) {
      percentages[pieceId] = {};
      for (const rotation in values[pieceId]) {
        percentages[pieceId][rotation] = (values[pieceId][rotation] / totalValue) * 100;
      }
    }

    return percentages;
  }, [hintAdjacencyStats, mlParams.useCalibration]);

  const value = {
    onlineCount,
    board, isRunning, currentRun, stats, hintAdjacencyStats, globalScoreDistribution, placementAttemptCounts, pieces, hints, mlParams, solutions, actualIps, bestBoards, failCounts, showBarrierMap, setShowBarrierMap, validationStatus, recentStats,
    handleStart, handlePause, handleReset, loadBackupData, getSelectionPercentages, setMlParams, setBoard, handleKick
 };

  return (
    <SolverContext.Provider value={value}>
      {children}
    </SolverContext.Provider>
  );
};
