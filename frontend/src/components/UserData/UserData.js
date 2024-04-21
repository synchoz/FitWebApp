import React, {createContext, useContext, useReducer, useEffect} from "react";

const UserContext = createContext();

const initialState = { imageLink: '' }

const reducer = (state, action) => {
    switch(action.type) {
        case 'SET_IMAGE':
            return { ...state, imageLink: action.payload };
        default:
            return state;
    }
}

export const UserContextProvider = ({children}) => {
    const [state, dispatch] = useReducer(reducer, initialState);
    return (
        <UserContext.Provider value={{state, dispatch}}>
            {children}
        </UserContext.Provider>
    );
};

export const useUserContext = () => useContext(UserContext);