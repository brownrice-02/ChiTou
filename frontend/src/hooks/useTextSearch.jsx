import { useState } from "react";
import GoogleMapReact from "google-map-react";
import debounce from "@/utils/debounce.js";

const useTextSearch = () => {
  const [autoMapApi, setAutoMapApi] = useState("");
  const [searchText, setSearchText] = useState("");
  const [searchTextResults, setSearchTextResults] = useState([]);

  const googleMapAutocomplete = debounce(async (inputText) => {
    console.log("googleMapAutocomplete");
    console.log(inputText);
    console.log(autoMapApi);
    const service = new autoMapApi.places.AutocompleteService();
    const request = {
      input: inputText, // input 為 inputText
    };

    service.getPlacePredictions(request, (results) => {
      setSearchTextResults(results || []);
      console.log(results);
    });
  }, 500);
  const handleSearchTextChange = (e) => {
    setSearchText(e.target.value);
    googleMapAutocomplete(e.target.value);
  };
  return {
    searchText,
    searchTextResults,
    setAutoMapApi,
    handleSearchTextChange,
  };
};

export default useTextSearch;
