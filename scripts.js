require([
  "esri/WebMap",
  "esri/views/MapView",
  "esri/layers/FeatureLayer",
  "esri/widgets/Search",
  "esri/widgets/Features",
  "esri/rest/support/Query",
  "esri/popup/content/RelationshipContent",
  "esri/core/reactiveUtils",
], function (
  WebMap,
  MapView,
  FeatureLayer,
  Search,
  Features,
  Query,
  RelationshipContent,
  reactiveUtils
) {
  const webmap = new WebMap({
    portalItem: {
      id: "6448b08504de4244973a28305b18271f",
    },
  });

  var view = new MapView({
    container: "viewDiv",
    map: webmap,
    zoom: 12,
    popupEnabled: false,
  });

  const noCondosLayer = new FeatureLayer({
    url: "https://services1.arcgis.com/j6iFLXhyiD3XTMyD/arcgis/rest/services/NoCondoParcels_RelatesBothWays/FeatureServer/0",
  });

  const CondosLayer = new FeatureLayer({
    url: "https://services1.arcgis.com/j6iFLXhyiD3XTMyD/arcgis/rest/services/CondoParcels_RelatesBothWays/FeatureServer/0",
  });

  const CondosTable = new FeatureLayer({
    url: "https://services1.arcgis.com/j6iFLXhyiD3XTMyD/arcgis/rest/services/CondoParcels_RelatesBothWays/FeatureServer/1",
  });

  const noCondosTable = new FeatureLayer({
    url: "https://services1.arcgis.com/j6iFLXhyiD3XTMyD/arcgis/rest/services/NoCondoParcels_RelatesBothWays/FeatureServer/1",
  });

  // const unitTable = new FeatureLayer({
  //   url: "https://services1.arcgis.com/j6iFLXhyiD3XTMyD/arcgis/rest/services/TESTRELATEFROMPARCELSTOTABLEONETOMANY/FeatureServer/1",
  // });

  webmap.add(noCondosLayer);
  webmap.add(CondosLayer);

  CondosTable.load().then(() => {
    webmap.tables.add(CondosTable);
  });

  noCondosTable.load().then(() => {
    webmap.tables.add(noCondosTable);
  });

  function queryRelatedRecords(searchTerm) {
    console.log(searchTerm);
    // const uniqueID = screenPoint;

    let whereClause = `
    Street_Name = '${searchTerm}' OR 
    MBL = '${searchTerm}' OR 
    Location = '${searchTerm}' OR 
    Co_Owner = '${searchTerm}' OR 
    Uniqueid = '${searchTerm}' OR 
    Owner = '${searchTerm}'
`;

    let query = noCondosLayer.createQuery();
    query.where = whereClause;
    query.returnGeometry = true; // Adjust based on your needs
    query.outFields = ["*"];

    // let query = noCondosLayer.createQuery();
    // query.where = `GIS_LINK = '${uniqueID}'`;
    // query.returnGeometry = true;
    // query.outFields = ["*"];

    noCondosLayer
      .queryFeatures(query)
      .then(function (result) {
        console.log(result);
        console.log(result.features);
        if (result.features) {
          view.goTo(result.features);
        } else {
          result.features.forEach(function (feature) {
            console.log(
              `No geometry found for: ${feature.attributes.Location}`
            );
          });
        }

        // MapView.layerView(noCondosLayer).then(function (layerView) {
        //   let handle = layerView.highlight();
        // });
        view.whenLayerView(noCondosLayer).then(function (layerView) {
          view.graphics.removeAll();
          let handle = layerView.highlight(result.features);
        });

        return noCondosLayer.queryObjectIds({
          where: `GIS_LINK = '${uniqueID}'`,
        });
      })
      .then(function (objectIds) {
        if (!objectIds.length) {
          console.warn(`No objectIds were found for ${uniqueID}.`);
          throw new Error("No objectIds found");
        }

        const query = {
          outFields: ["*"],
          relationshipId: 0,
          objectIds: objectIds,
        };

        // Return both the objectIds and the result of queryRelatedFeatures
        return Promise.all([
          objectIds,
          noCondosLayer.queryRelatedFeatures(query),
        ]);
      })
      .then(function ([objectIds, result]) {
        // Destructure the results array into objectIds and result
        const obj = result;
        console.log(obj);
        const value = obj[objectIds];
        const features = value.features;

        features.forEach(function (feature) {
          const featureWidDiv = document.getElementById("dropdown");
          const listGroup = document.createElement("ul");
          listGroup.classList.add("list-group");

          let value = feature.attributes["GIS_LINK"];
          let value2 = feature.attributes["Uniqueid"];

          const listItem = document.createElement("li");
          listItem.classList.add("list-group-item");
          listItem.textContent = `GIS LINK: ${value} and Unique ID: ${value2}`;

          listGroup.appendChild(listItem);
          featureWidDiv.appendChild(listGroup);
          $("#dropdown").toggleClass("expanded");
        });
      })
      .catch(function (error) {
        console.error("Error:", error);
      });
  }

  const runQuery = (event) => {
    let features;
    console.log(event.srcElement.innerText);
    let searchTerm = event.srcElement.innerText;
    // console.log(searchTerm);
    $("#dropdown").empty();
    $("#dropdown").toggleClass("expanded");

    let whereClause = `
          Street_Name = '${searchTerm}' OR 
          MBL = '${searchTerm}' OR 
          Location = '${searchTerm}' OR 
          Co_Owner = '${searchTerm}' OR 
          Uniqueid = '${searchTerm}' OR 
          Owner = '${searchTerm}' OR
          GIS_LINK = '${searchTerm}'
      `;

    let query = noCondosTable.createQuery();
    query.where = whereClause;
    query.returnGeometry = false; // Adjust based on your needs
    query.outFields = ["*"]; // Retrieve all fields

    noCondosTable
      .queryFeatures(query)
      .then((response) => {
        // Process the detailed results here
        // For instance, you can display more info or zoom to the feature's location
        if (response.features.length > 0) {
          features = response.features;
          features.forEach(function (feature) {
            console.log("Detailed feature:", feature.attributes.Location);

            const featureWidDiv = document.getElementById("dropdown");
            const listGroup = document.createElement("ul");
            listGroup.classList.add("list-group");

            let locationVal = feature.attributes.Location;
            let locationUniqueId = feature.attributes["Uniqueid"];
            let locationGISLINK = feature.attributes["GIS_LINK"];

            const listItem = document.createElement("li");
            listItem.classList.add("list-group-item");
            listItem.textContent = `Location: ${locationVal} and Unique ID: ${locationUniqueId} and GIS_LINK: ${locationGISLINK}`;

            listGroup.appendChild(listItem);
            featureWidDiv.appendChild(listGroup);
            $("#dropdown").toggleClass("expanded");
            $("#dropdown").show();
          });
        }
      })
      .catch((error) => {
        console.error("Error querying for details:", error);
      });

    // Now query the related records based on this objectId
    queryRelatedRecords(event.srcElement.innerText);
  };

  // Attach event listener to the search input
  document
    .getElementById("searchInput")
    .addEventListener("input", function (e) {
      const searchTerm = e.target.value.toUpperCase();

      if (searchTerm.length < 3) {
        return;
      }
      console.log(searchTerm);

      // Construct your where clause
      let whereClause = `
            Street_Name LIKE '%${searchTerm}%' OR 
            MBL LIKE '%${searchTerm}%' OR 
            Location LIKE '%${searchTerm}%' OR 
            Co_Owner LIKE '%${searchTerm}%' OR 
            Uniqueid LIKE '%${searchTerm}%' OR 
            Owner LIKE '%${searchTerm}%'
        `;

      let query = noCondosTable.createQuery();
      query.where = whereClause;
      query.returnGeometry = false;
      query.outFields = [
        "Street_Name",
        "MBL",
        "Location",
        "Co_Owner",
        "Uniqueid",
        "Owner",
      ];

      let uniqueSuggestions = new Set();

      noCondosTable.queryFeatures(query).then((response) => {
        console.log(response);
        let suggestionsContainer = document.getElementById("suggestions");
        suggestionsContainer.innerHTML = ""; // Clear previous suggestions

        response.features.forEach((feature) => {
          console.log("Processing feature:", feature);
          [
            "Street_Name",
            "MBL",
            "Location",
            "Co_Owner",
            "Uniqueid",
            "Owner",
          ].forEach((fieldName) => {
            console.log("Processing field:", fieldName);
            let value = feature.attributes[fieldName];

            // NEEDS TO RETURN NAME OF FIELDS SEARCHED
            //SO LIKE 289 TUNNEL Rd, 14 Tunnel Rd etc....
            if (
              value &&
              value.includes(searchTerm) &&
              !uniqueSuggestions.has(value)
            ) {
              let suggestionDiv = document.createElement("div");
              suggestionDiv.className = "list-group-item"; // Using Bootstrap's class for list items
              suggestionDiv.innerText = `${value}`;
              // suggestionDiv.innerText = `${fieldName}: ${value}`;
              console.log("Appending suggestion:", suggestionDiv);
              suggestionsContainer.appendChild(suggestionDiv);

              // Add the value to the Set
              uniqueSuggestions.add(value);
              suggestionsContainer.style.display = "block";
              console.log(suggestionDiv);

              suggestionDiv.addEventListener("click", function (e) {
                runQuery(e);
                console.log("Suggestion clicked:", e.target.innerText);
                // Handle suggestion click
              });
            }
          });
        });
      });
    });

  // Prevent form submission (page reload) when the search button is clicked
  document
    .querySelector(".form-inline")
    .addEventListener("submit", function (e) {
      e.preventDefault();
      // You can handle the search action here, for instance, if you want to fetch more details based on a selected suggestion or search term
    });

  // Hide suggestions when clicking outside
  document.addEventListener("click", function (e) {
    if (e.target.id !== "searchInput") {
      document.getElementById("suggestions").style.display = "none";
    }
  });

  // let highlight;
  // let relatedResults = [];
  // LOGIC for click and query related records

  // view.on("click", (event) => {
  //   queryPointFeatures(event);
  // });

  // function queryRelatedRecords(screenPoint) {
  //   const uniqueID = screenPoint;

  //   let query = noCondosLayer.createQuery();
  //   query.where = `GIS_LINK = '${uniqueID}'`;
  //   query.returnGeometry = true;
  //   query.outFields = ["*"];

  //   noCondosLayer
  //     .queryFeatures(query)
  //     .then(function (result) {
  //       console.log(result);
  //       console.log(result.features);
  //       view.goTo(result.features);

  //       return noCondosLayer.queryObjectIds({
  //         where: `GIS_LINK = '${uniqueID}'`,
  //       });
  //     })
  //     .then(function (objectIds) {
  //       if (!objectIds.length) {
  //         console.warn(`No objectIds were found for ${uniqueID}.`);
  //         throw new Error("No objectIds found");
  //       }

  //       const query = {
  //         outFields: ["*"],
  //         relationshipId: 0,
  //         objectIds: objectIds,
  //       };

  //       // Return both the objectIds and the result of queryRelatedFeatures
  //       return Promise.all([
  //         objectIds,
  //         noCondosLayer.queryRelatedFeatures(query),
  //       ]);
  //     })
  //     .then(function ([objectIds, result]) {
  //       // Destructure the results array into objectIds and result
  //       const obj = result;
  //       console.log(obj);
  //       const value = obj[objectIds];
  //       const features = value.features;

  //       features.forEach(function (feature) {
  //         const featureWidDiv = document.getElementById("dropdown");
  //         const listGroup = document.createElement("ul");
  //         listGroup.classList.add("list-group");

  //         let value = feature.attributes["GIS_LINK"];
  //         let value2 = feature.attributes["Uniqueid"];

  //         const listItem = document.createElement("li");
  //         listItem.classList.add("list-group-item");
  //         listItem.textContent = `GIS LINK: ${value} and Unique ID: ${value2}`;

  //         listGroup.appendChild(listItem);
  //         featureWidDiv.appendChild(listGroup);
  //         $("#dropdown").toggleClass("expanded");
  //       });
  //     })
  //     .catch(function (error) {
  //       console.error("Error:", error);
  //     });
  // }

  // function queryRelatedRecords2(screenPoint) {
  //   const uniqueID = screenPoint;

  //   let query = CondosLayer.createQuery();
  //   query.where = `Uniqueid = '${uniqueID}'`;
  //   query.returnGeometry = true;
  //   query.outFields = ["*"];

  //   noCondosLayer
  //     .queryFeatures(query)
  //     .then(function (result) {
  //       console.log(result);
  //       console.log(result.features);
  //       view.goTo(result.features);

  //       return noCondosLayer.queryObjectIds({
  //         where: `Uniqueid = '${uniqueID}'`,
  //       });
  //     })
  //     .then(function (objectIds) {
  //       if (!objectIds.length) {
  //         console.warn(`No objectIds were found for ${uniqueID}.`);
  //         throw new Error("No objectIds found");
  //       }

  //       const query = {
  //         outFields: ["*"],
  //         relationshipId: 0,
  //         objectIds: objectIds,
  //       };

  //       // Return both the objectIds and the result of queryRelatedFeatures
  //       return Promise.all([
  //         objectIds,
  //         CondosLayer.queryRelatedFeatures(query),
  //       ]);
  //     })
  //     .then(function ([objectIds, result]) {
  //       // Destructure the results array into objectIds and result
  //       const obj = result;
  //       console.log(obj);
  //       const value = obj[objectIds];
  //       const features = value.features;

  //       features.forEach(function (feature) {
  //         const featureWidDiv = document.getElementById("dropdown");
  //         const listGroup = document.createElement("ul");
  //         listGroup.classList.add("list-group");

  //         let value = feature.attributes["GIS_LINK"];
  //         let value2 = feature.attributes["Uniqueid"];

  //         const listItem = document.createElement("li");
  //         listItem.classList.add("list-group-item");
  //         listItem.textContent = `GIS LINK: ${value} and Unique ID: ${value2}`;

  //         listGroup.appendChild(listItem);
  //         featureWidDiv.appendChild(listGroup);
  //         $("#dropdown").toggleClass("expanded");
  //       });
  //     })
  //     .catch(function (error) {
  //       console.error("Error:", error);
  //     });
  // }

  // const featuresWidget = new Features({
  //   container: "feature-wid",
  //   view: view,
  // });

  const searchWidget = new Search({
    container: "searchContainer",
    view: view,
    allPlaceholder: "Search Parcels",
    includeDefaultSources: false,
    popupEnabled: false,
    // maxResults: 60,
    sources: [
      {
        layer: noCondosTable,
        searchFields: [
          "Uniqueid",
          "MBL",
          "Owner",
          "Co_Owner",
          "Location",
          "Street_Number",
          "Mailing_Address_1",
          "Street_Name",
        ],
        displayField: "Location",
        outFields: ["*"],
        name: "Parcels",
        placeholder: "Search No Condo Parcels",
      },
    ],
  });

  const searchWidget2 = new Search({
    container: "searchContainer",
    view: view,
    allPlaceholder: "Search Parcels",
    includeDefaultSources: false,
    maxResults: 60,
    sources: [
      {
        layer: CondosLayer,
        searchFields: [
          "UniqueId",
          "MBL",
          "Owner",
          "Co_Owner",
          "Location",
          "Street_Number",
          "Mailing_Address_1",
          "Street_Name",
        ],
        displayField: "UniqueId",
        outFields: ["*"],
        name: "Parcels",
        placeholder: "Search Condo Parcels",
      },
    ],
  });

  // Adds the search widget below other elements in
  // the top left corner of the view
  // view.ui.add(searchWidget, { position: "bottom-left" });
  // view.ui.add(searchWidget2, { position: "bottom-left" });

  searchWidget.on("select-result", function (event) {
    console.log(event);
    $("#dropdown").empty();

    $("#dropdown").toggleClass("expanded");

    if (event.result && event.result.feature) {
      const objectId = event.result.feature.attributes.GIS_LINK;
      console.log(objectId);

      // Handle table results immediately
      const tableAttributes = event.result.feature.attributes;
      populateListItemsFromTableResults(tableAttributes);

      // Now query the related records based on this objectId
      queryRelatedRecords(objectId);
    }
  });

  function populateListItemsFromTableResults(attributes) {
    // $("#dropdown").toggle();
    // Given the attributes from the table, create and display list items
    const featureWidDiv = document.getElementById("dropdown");

    const listGroup = document.createElement("ul");
    listGroup.classList.add("list-group");

    // Example: Displaying the Owner as a list item. Add more as needed.
    const listItem = document.createElement("li");
    listItem.classList.add("list-group-item");
    listItem.textContent = `Owner: ${attributes.Owner}, GIS_LINK: ${attributes.GIS_LINK}`;
    listGroup.appendChild(listItem);

    featureWidDiv.appendChild(listGroup);
  }

  searchWidget2.on("select-result", function (event) {
    $("#dropdown").empty();
    $("#dropdown").toggleClass("expanded");

    if (event.result && event.result.feature) {
      const objectId = event.result.feature.attributes.Uniqueid;
      console.log(objectId);

      // Handle table results immediately
      const tableAttributes = event.result.feature.attributes;
      populateListItemsFromTableResults(tableAttributes);

      // Now query the related records based on this objectId
      queryRelatedRecords(objectId);
    }
  });

  function populateListItemsFromTableResults(attributes) {
    if ($("#dropdown").css("display") === "none") {
      $("#dropdown").show(); // or .css("display", "block") depending on your needs
    } else {
      $("#dropdown").hide();
    }

    // $("#dropdown").toggle();
    // Given the attributes from the table, create and display list items
    const featureWidDiv = document.getElementById("dropdown");

    const listGroup = document.createElement("ul");
    listGroup.classList.add("list-group");

    // Example: Displaying the Owner as a list item. Add more as needed.
    const listItem = document.createElement("li");
    listItem.classList.add("list-group-item");
    listItem.textContent = `UniqueId: ${attributes.Uniqueid}, GIS_LINK: ${attributes.GIS_LINK}`;
    listGroup.appendChild(listItem);

    featureWidDiv.appendChild(listGroup);
  }

  $(document).ready(function () {
    $(".list-group-item").on("click", function () {
      // Your event handling code here
      console.log("Item clicked:", $(this).text());
    });
  });

  $(document).ready(function () {
    $("#dropdownMenuButton").on("click", function () {
      $("#dropdown").toggleClass("expanded");
      if ($("#dropdown").hasClass("expanded")) {
        $("#up-arrow").show();
        $("#down-arrow").hide(); // Hide left arrow
        // Show right arrow
      } else {
        $("#down-arrow").show(); // Show left arrow
        $("#up-arrow").hide(); // Hide right arrow
      }
    });

    $(document).ready(function () {
      $("#side-Exp").on("click", function () {
        $("#sidebar").toggleClass("collapsed");

        // Check if the sidebar has the class 'collapsed' and adjust the 'right' property of #small-div accordingly
        // Toggle the 'right' CSS property for #small-div
        if ($("#sidebar").hasClass("collapsed")) {
          $("#small-div").css("right", "0px");
          $("#right-arrow").hide();
          $("#left-arrow").show(); // Hide left arrow
          // Show right arrow
        } else {
          $("#small-div").css("right", "250px");
          $("#left-arrow").hide(); // Show left arrow
          $("#right-arrow").show(); // Hide right arrow
        }
      });
    });
  });
});
