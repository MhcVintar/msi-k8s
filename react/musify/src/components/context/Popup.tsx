import React, { createContext, useContext } from "react";
import { useLocation, useNavigate } from "react-router-dom";

type PopupContext = [
  state: string | null,
  setState: (state: PopupState) => void,
];

const Popup = createContext<PopupContext | null>(null);

type PopupState =
  | "delete-account"
  | "hidden"
  | "login"
  | "register"
  | "reset-password"
  | "new-password";

export default function PopupProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const popupState = searchParams.get("popup");
  const navigate = useNavigate();

  function setPopupState(state: PopupState) {
    if (state === "hidden") {
      searchParams.delete("popup");
    } else {
      searchParams.set("popup", state);
    }
    navigate("?" + searchParams.toString());
  }

  return (
    <Popup.Provider value={[popupState, setPopupState]}>
      {children}
    </Popup.Provider>
  );
}

export function usePopup() {
  const context = useContext(Popup);
  if (!context) {
    throw new Error("usePopup() can only be called in its provider");
  }
  return context;
}
