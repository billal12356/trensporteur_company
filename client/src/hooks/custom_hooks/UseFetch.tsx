import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../redux/store";

// هوك عام لجلب البيانات من Redux
const useFetch = <T extends keyof RootState>({
    stateName,
    fetchName,
}: {
    stateName: T;
    fetchName: () =>  (dispatch: AppDispatch) => Promise<RootState[T]>;
}) => {
    const dispatch = useDispatch<AppDispatch>();

    // استخدام `state[stateName]` مع `as` لتحديد نوع البيانات
    const stateData = useSelector((state: RootState) => state[stateName]) as RootState[T];

    useEffect(() => {
        dispatch(fetchName());
    }, [dispatch, fetchName]);

    return stateData;
};

export default useFetch;
