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

  // console.log(webmap);

  const noCondosLayer = new FeatureLayer({
    url: "https://services1.arcgis.com/j6iFLXhyiD3XTMyD/arcgis/rest/services/CT_Washington_Adv_Viewer_Parcels_NOCONDOS/FeatureServer/1",
  });

  const CondosLayer = new FeatureLayer({
    url: "https://services1.arcgis.com/j6iFLXhyiD3XTMyD/arcgis/rest/services/CT_Washington_Adv_Viewer_Parcels_CONDOS/FeatureServer/1",
  });

  // const noCondosLayer = new FeatureLayer({
  //   url: "https://services1.arcgis.com/j6iFLXhyiD3XTMyD/arcgis/rest/services/NoCondoParcels_RelatesBothWays/FeatureServer/0",
  // });

  // const CondosLayer = new FeatureLayer({
  //   url: "https://services1.arcgis.com/j6iFLXhyiD3XTMyD/arcgis/rest/services/CondoParcels_RelatesBothWays/FeatureServer/0",
  // });

  const CondosTable = new FeatureLayer({
    url: "https://services1.arcgis.com/j6iFLXhyiD3XTMyD/arcgis/rest/services/CondoParcels_RelatesBothWays/FeatureServer/1",
  });

  const noCondosTable = new FeatureLayer({
    url: "https://services1.arcgis.com/j6iFLXhyiD3XTMyD/arcgis/rest/services/NoCondoParcels_RelatesBothWays/FeatureServer/1",
  });

  let runQuerySearchTerm;
  let clickedToggle;
  let handle1;
  let handle2;

  console.log(handle1);
  console.log(handle2);

  const clearBtn = document.getElementById("clear-btn");

  clearBtn.addEventListener("click", function () {
    $("#searchInput").val = "";
    // Get a reference to the search input field
    const searchInput = document.getElementById("searchInput");

    // To clear the text in the input field, set its value to an empty string
    searchInput.value = "";

    $("#dropdown").empty();
    $("#dropdown").toggleClass("expanded");
    $("#dropdown").hide();
    runQuerySearchTerm = "";
    // runQuerySearchTerm = "";
    searchTerm = "";
    let suggestionsContainer = document.getElementById("suggestions");
    suggestionsContainer.innerHTML = "";
    if (handle1) {
      handle1.remove();
    }
    if (handle2) {
      handle2.remove();
    }

    view.goTo(webmap.portalItem.extent);
  });

  $("#searchInput").on("input", function () {
    let searchInput = document.getElementById("searchInput");
    console.log(searchInput);
  });
  view.ui.add(clearBtn, "top-left");

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

  document
    .getElementById("searchInput")
    .addEventListener("input", function (e) {
      runQuerySearchTerm = e.target.value.toUpperCase();
    });

  function queryRelatedRecords(searchTerm) {
    console.log(searchTerm);
    // const uniqueID = screenPoint;

    let whereClause = `
    Street_Name LIKE '%${searchTerm}%' OR 
    MBL LIKE '%${searchTerm}%' OR 
    Location LIKE '%${searchTerm}%' OR 
    Co_Owner LIKE '%${searchTerm}%' OR 
    Uniqueid LIKE '%${searchTerm}%' OR 
    Owner LIKE '%${searchTerm}%' OR 
    GIS_LINK LIKE '%${searchTerm}%'
`;

    let query = noCondosLayer.createQuery();
    query.where = whereClause;
    query.returnGeometry = true; // Adjust based on your needs
    query.outFields = ["*"];

    let query2 = CondosLayer.createQuery();
    query2.where = whereClause;
    query2.returnGeometry = true; // Adjust based on your needs
    query2.outFields = ["*"];
    // let query = noCondosLayer.createQuery();
    // query.where = `GIS_LINK = '${uniqueID}'`;
    // query.returnGeometry = true;
    // query.outFields = ["*"];

    noCondosLayer
      .queryFeatures(query)
      .then(function (result) {
        console.log(result);
        console.log(result.features);
        if (result.features.length > 0) {
          view.goTo(result.features);
          console.log(` No condos layer is highlighted`);
          view.whenLayerView(noCondosLayer).then(function (layerView) {
            handle1 = layerView.highlight(result.features);
          });
        } else {
          // result.features.forEach(function (feature) {
          CondosLayer.queryFeatures(query2).then(function (result) {
            console.log(result);
            console.log(result.features);
            if (result.features) {
              console.log(`condos layer is highlighted`);
              view.goTo(result.features);
              view.whenLayerView(CondosLayer).then(function (layerView) {
                handle2 = layerView.highlight(result.features);
              });
            }
          });
          // console.log(`No geometry found for: ${feature.attributes.Location}`);
          // });
        }

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

  const runQuery = (e) => {
    let suggestionsContainer = document.getElementById("suggestions");
    suggestionsContainer.innerHTML = "";
    // console.log(e);
    let features;
    if (clickedToggle) {
      runQuerySearchTerm = e;
    }

    // console.log(event.srcElement.innerText);
    let searchTerm = runQuerySearchTerm;
    console.log(searchTerm);
    // console.log(searchTerm);
    $("#dropdown").empty();
    $("#dropdown").toggleClass("expanded");
    // Construct your where clause
    let whereClause = `
            Street_Name LIKE '%${searchTerm}%' OR 
            MBL LIKE '%${searchTerm}%' OR 
            Location LIKE '%${searchTerm}%' OR 
            Co_Owner LIKE '%${searchTerm}%' OR 
            Uniqueid LIKE '%${searchTerm}%' OR 
            Owner LIKE '%${searchTerm}%' OR
            GIS_LINK LIKE '%${searchTerm}%'
        `;

    let query = noCondosTable.createQuery();
    query.where = whereClause;
    query.returnGeometry = false; // Adjust based on your needs
    query.outFields = [
      "Street_Name",
      "MBL",
      "Location",
      "Co_Owner",
      "Uniqueid",
      "Owner",
      "GIS_LINK",
    ]; // Retrieve all fields
    console.log(query);
    noCondosTable
      .queryFeatures(query)
      .then((response) => {
        console.log(response);
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
            let locationCoOwner = feature.attributes["Co_Owner"];
            let locationOwner = feature.attributes["Owner"];
            let locationMBL = feature.attributes["MBL"];

            const listItem = document.createElement("li");
            listItem.classList.add("list-group-item");
            listItem.textContent = `Location: ${locationVal}, Unique ID: ${locationUniqueId}, GIS_LINK: ${locationGISLINK}
            Co-Owner: ${locationCoOwner}, Owner: ${locationOwner}, MBL: ${locationMBL}`;

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
    queryRelatedRecords(runQuerySearchTerm);
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
                clickedToggle = true;
                // let clicked = e.srcElement.innerHTML;
                runQuery(e.target.innerHTML);
                clickedToggle = false;
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

  // document.addEventListener("keydown", function (event) {
  //   if (event.key === "Enter") {
  //     runQuery();
  //     console.log("Enter is being pressed");
  //   }
  // });

  document.getElementById("searchButton").addEventListener("click", runQuery);

  // $(document).ready(function () {
  //   $(".list-group-item").on("click", function () {
  //     // Your event handling code here
  //     console.log("Item clicked:", $(this).text());
  //   });
  // });

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
