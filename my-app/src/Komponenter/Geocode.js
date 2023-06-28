import React, { useState } from "react";
import "../css/Geocode.css";
import "@navikt/ds-css";
import { Button, TextField } from "@navikt/ds-react";
import PhotoImport from "./PhotoImport";
import { ArrowRightIcon } from "@navikt/aksel-icons";
import { Pagination } from "@navikt/ds-react";

const Geocode = () => {
  const [address, setAddress] = useState("");
  const [response, setResponse] = useState(null);
  const [showButton, setShowButton] = useState(false);
  const [showPhotoImport, setShowPhotoImport] = useState(false);
  const [showNextButton, setShowNextButton] = useState(false);

  const geocodeAddress = async (address) => {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&addressdetails=1&q=${address}`
    );
    const data = await response.json();
    setResponse(data[0]);
    setShowButton(true);
  };

  const [pageState, setPageState] = useState(2);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (address.trim() !== "") {
      geocodeAddress(address);
    }
  };

  const handleConfirm = () => {
    console.log(
      "Bekreft og lagre: Latitude:",
      response.lat,
      "Longitude:",
      response.lon
    );
    setShowNextButton(true);
  };

  const handleNextPage = () => {
    setShowPhotoImport(true);
  };

  const resetForm = () => {
    setAddress("");
    setResponse(null);
    setShowButton(false);
    setShowNextButton(false);
  };

  return (
    <React.Fragment>
      <Pagination
        className="pagination-container"
        page={pageState}
        onPageChange={(x) => setPageState(x)}
        count={5}
        boundaryCount={1}
        siblingCount={1}
        size="medium"
      />
      <div className={!showPhotoImport ? "geocodeStyle" : ""}>
        <div id="plassering">
          {!showPhotoImport ? (
            <form onSubmit={handleSubmit} className="form-container">
              <h1>L O C A T I O N</h1> <br />
              <TextField
                required
                label="Type in your adress and city"
                id="address"
                name="address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="input-field"
              />
              <Button variant="primary" type="submit" className="submit-button">
                Check if it's the correct address
              </Button>
              {response && (
                <div>
                  <br />
                  <h4>Is this correct</h4>
                  <p>
                    Adresse: {response.address.road}{" "}
                    {response.address.house_number || "N/A"} {""}
                    {response.address.city || response.address.town}{" "}
                    {response.address.postcode} {response.address.country}
                  </p>
                  <br></br>
                  <p>
                    If it's not correct, please enter the city in the field
                    above
                  </p>
                  <br></br>

                  <Button
                    variant="primary"
                    onClick={handleConfirm}
                    style={{ display: showButton ? "block" : "none" }}
                  >
                    Save & confirm
                  </Button>
                </div>
              )}
              <br />
              <Button
                variant="secondary"
                className="next-button"
                style={{ display: showNextButton ? "block" : "none" }}
                onClick={handleNextPage}
              >
                <span className="next-button-content">
                  Next page
                  <ArrowRightIcon />
                </span>
              </Button>
            </form>
          ) : (
            " "
          )}
        </div>
      </div>
      {showPhotoImport ? <PhotoImport /> : null}
    </React.Fragment>
  );
};

export default Geocode;
