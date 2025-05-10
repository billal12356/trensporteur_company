import { fetchInterCommuneStats, fetchInterWilayaStats, fetchRuralStats } from "@/redux/slice/stateSlice";
import { RootState } from "@/redux/store";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

const dispatch = useDispatch();
const { interCommune, interWilaya, rural, loading, error } = useSelector(
    (state: RootState) => state.stats
);

useEffect(() => {
    dispatch(fetchInterCommuneStats() as any);
    dispatch(fetchInterWilayaStats() as any);
    dispatch(fetchRuralStats() as any);
}, [dispatch]);

export const data = [
    {
        type: 'Inter-wilaya',
        nbVehicules: interWilaya?.nbVehicules,
        nbOperators: interWilaya?.nbOperators,
        nbPlaces: interWilaya?.nbPlaces,
        tranche_0_5: 0,
        tranche_6_10: 0,
        tranche_11_15: 92,
        tranche_15_20: 61,
        tranche_plus_20: 0,
        en_activite: interWilaya?.en_activite,
        arret: interWilaya?.arret,
        avgAge: interWilaya?.avgAge,
        nbLignes: interWilaya?.totalTrajets,
    },
    {
        type: 'Inter-communal',
        nbVehicules: 460,
        nbOperators: 411,
        nbPlaces: 12226,
        tranche_0_5: 0,
        tranche_6_10: 4,
        tranche_11_15: 146,
        tranche_15_20: 141,
        tranche_plus_20: 169,
        en_activite: 460,
        arret: 25,
        avgAge: '17 ans',
        nbLignes: 45,
    },
    {
        type: 'Rural',
        nbVehicules: 278,
        nbOperators: 244,
        nbPlaces: 7068,
        tranche_0_5: 0,
        tranche_6_10: 48,
        tranche_11_15: 91,
        tranche_15_20: 138,
        tranche_plus_20: 0,
        en_activite: 278,
        arret: 28,
        avgAge: '32 ans',
        nbLignes: 80,
    },
];