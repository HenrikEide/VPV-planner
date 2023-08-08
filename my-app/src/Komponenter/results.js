import React, { useState, useEffect } from "react";
import Navbar from "./navbar";
import { Button, Table } from "@navikt/ds-react";
import "../css/results.css";
import StepperInd from "./Stepper";
import {
  getSessionStorageAll,
  getUnitCount,
  fetchEnergyYield,
} from "./storageUtils";

export default function Results() {
  const [apiData, setApiData] = useState(null);

  const {
    projectName,
    projectNumber,
    installer,
    PNinstaller,
    EndCostumer,
    projectNumberEC,
    sections,
    grids,
    layouts,
    address,
    info,
    lat,
    lon,
    azimuth,
    kWp,
    loss,
    imgurl,
    screenshotTransparent,
    screenshotOpaque,
  } = getSessionStorageAll();

  const nUnits = getUnitCount(layouts);

  useEffect(() => {
    const fetchData = async () => {
      const apiData = await fetchEnergyYield(lat, lon, azimuth, kWp, loss);
      setApiData(parseFloat(apiData));
    };
    fetchData();
  }, [azimuth, kWp, lat, lon, loss]);

  function get(grid, i, j) {
    // Return value of (i, j) if it exists, else 0
    try {
      return grid[i][j] || 0;
    } catch (error) {
      return 0;
    }
  }

  function countFeet(grid, i, j) {
    // Count the number of feet needed for cell (i, j)
    const currentCell = grid[i][j];
    if (!currentCell) {
      // No unit => no feet
      return 0;
    }

    const tl =
      !get(grid, i - 1, j) && !get(grid, i, j - 1) && !get(grid, i - 1, j - 1);
    const tr = !get(grid, i - 1, j);
    const bl = !get(grid, i, j - 1);

    return tl + tr + bl + 1;
  }

  function totCount(grid) {
    // Return the total number of feet needed for the grid
    let totalFeet = 0;
    for (let i = 0; i < grid.length; i++) {
      for (let j = 0; j < grid[0].length; j++) {
        totalFeet += countFeet(grid, i, j);
      }
    }
    return totalFeet;
  }

  function handleDownload() {
    const link1 = document.createElement("a");
    link1.href = screenshotTransparent;
    link1.download = "screenshot1.png";
    link1.click();

    const link2 = document.createElement("a");
    link2.href = screenshotOpaque;
    link2.download = "screenshot2.png";
    link2.click();
  }

  useEffect(() => {
    // Do something with the retrieved data
    console.log("Project Name:", projectName);
    console.log("Project Number:", projectNumber);
    console.log("Installer:", installer);
    console.log("PN Installer:", PNinstaller);
    console.log("End Customer:", EndCostumer);
    console.log("Project Number EC:", projectNumberEC);
    console.log("Sections:", sections);
    console.log("Grids:", grids, "Length:", grids.length);
    console.log("Layout0:", layouts[0]);
    console.log("Address:", address);
    console.log("Info:", info);
    console.log("Lat:", lat);
    console.log("Lon:", lon);
    console.log("nUnits:", nUnits);
    console.log("Azimuth:", azimuth);
    console.log("Imgurl:", imgurl);
  }, []);

  return (
    <>
      <Navbar />
      <div className="container">
        <div className="row">
          <div className="col-12">
            <h1>Results</h1>
            <Table>
              <Table.Header>
                <Table.Row>
                  <Table.HeaderCell scope="col">Project Name</Table.HeaderCell>
                  <Table.HeaderCell scope="col">
                    Project Number
                  </Table.HeaderCell>
                  <Table.HeaderCell scope="col">Installer</Table.HeaderCell>
                  <Table.HeaderCell scope="col">PN Installer</Table.HeaderCell>
                  <Table.HeaderCell scope="col">End Customer</Table.HeaderCell>
                  <Table.HeaderCell scope="col">
                    Project Number EC
                  </Table.HeaderCell>
                </Table.Row>
              </Table.Header>
              <Table.Body>
                <Table.Row>
                  <Table.DataCell>{projectName}</Table.DataCell>
                  <Table.DataCell>{projectNumber}</Table.DataCell>
                  <Table.DataCell>{installer}</Table.DataCell>
                  <Table.DataCell>{PNinstaller}</Table.DataCell>
                  <Table.DataCell>{EndCostumer}</Table.DataCell>
                  <Table.DataCell>{projectNumberEC}</Table.DataCell>
                </Table.Row>
              </Table.Body>
            </Table>
            <br />
            <Table>
              <Table.Header>
                <Table.Row>
                  <Table.HeaderCell scope="col">Address</Table.HeaderCell>
                  {info !== "" && (
                    <Table.HeaderCell scope="col">Info</Table.HeaderCell>
                  )}
                  <Table.HeaderCell scope="col">Lat</Table.HeaderCell>
                  <Table.HeaderCell scope="col">Lon</Table.HeaderCell>
                  <Table.HeaderCell scope="col">Azimuth</Table.HeaderCell>
                  <Table.HeaderCell scope="col">Layout</Table.HeaderCell>
                  <Table.HeaderCell scope="col">
                    Total number of units
                  </Table.HeaderCell>
                </Table.Row>
              </Table.Header>
              <Table.Body>
                <Table.Row>
                  <Table.DataCell>{address}</Table.DataCell>
                  {info !== "" && <Table.DataCell>{info}</Table.DataCell>}
                  <Table.DataCell>{lat}</Table.DataCell>
                  <Table.DataCell>{lon}</Table.DataCell>
                  <Table.DataCell>{azimuth}</Table.DataCell>
                  <Table.DataCell>
                    <ul>
                      {layouts.map((layout, i) => (
                        <li key={i}>
                          Layout{i}: {JSON.stringify(layout)}
                        </li>
                      ))}
                    </ul>
                  </Table.DataCell>
                  <Table.DataCell>{nUnits}</Table.DataCell>
                </Table.Row>
              </Table.Body>
            </Table>
            <br />
            <h3>Bill Of Materials</h3>
            <div>
              <h4> Total amount of feet (support): </h4>
              {layouts.map((layout, i) => (
                <p key={i}>
                  Layout {i}: {totCount(layout)}
                </p>
              ))}
            </div>
            <h4>Cable cradles:</h4>
            {layouts.map((layout, i) => (
              <p key={i}>
                Layout {i}: {layout.length * 2}
              </p>
            ))}
            <br />
            <h3>Energy yield estimation</h3>
            <h4>
              Using {kWp} kWp, {loss}% loss and {(azimuth + 180) % 360}° main
              side direction:
            </h4>
            {apiData ? (
              <>
                <Table>
                  <Table.Header>
                    <Table.Row>
                      <Table.HeaderCell scope="col">
                        Specific yield
                      </Table.HeaderCell>
                      <Table.HeaderCell scope="col">Total</Table.HeaderCell>
                    </Table.Row>
                  </Table.Header>
                  <Table.Body>
                    <Table.Row>
                      <Table.DataCell>{apiData} kWh</Table.DataCell>
                      <Table.DataCell>{apiData * nUnits} kWh</Table.DataCell>
                    </Table.Row>
                  </Table.Body>
                </Table>
              </>
            ) : (
              <p>Loading...</p>
            )}
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div style={{ flex: 1, marginRight: "1rem" }}>
              {screenshotTransparent && (
                <img
                  src={screenshotTransparent}
                  alt="Transparent Screenshot"
                  style={{ width: "100%", maxWidth: "500px" }}
                />
              )}
            </div>

            <div style={{ flex: 1 }}>
              {screenshotOpaque && (
                <img
                  src={screenshotOpaque}
                  alt="Opaque Screenshot"
                  style={{ width: "100%", maxWidth: "500px" }}
                />
              )}
            </div>

            {screenshotTransparent && screenshotOpaque && (
              <Button
                variant="primary"
                style={{ marginTop: "1rem" }}
                onClick={handleDownload}
              >
                Download imgs
              </Button>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
