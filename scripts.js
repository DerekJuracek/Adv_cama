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
    defaultpopupTemplateEnabled: true,
  });

  const CondosLayer = new FeatureLayer({
    url: "https://services1.arcgis.com/j6iFLXhyiD3XTMyD/arcgis/rest/services/CT_Washington_Adv_Viewer_Parcels_CONDOS/FeatureServer/1",
  });

  class CondoTableElements {
    constructor(location, MBL, uniqueId, coOwner, owner, gisLink, geometry) {
      this.location = location;
      this.MBL = MBL;
      this.uniqueId = uniqueId;
      this.coOwner = coOwner;
      this.owner = owner;
      this.GIS_LINK = gisLink;
      this.geometry = geometry;
    }
  }

  // class CondoLayerElements {
  //   constructor(location, MBL, uniqueId, coOwner, owner, gisLink, geometry) {
  //     this.location = location;
  //     this.MBL = MBL;
  //     this.uniqueId = uniqueId;
  //     this.coOwner = coOwner;
  //     this.owner = owner;
  //     this.GIS_LINK = gisLink;
  //     this.geometry = geometry;
  //   }
  // }

  // const noCondosLayer = new FeatureLayer({
  //   url: "https://services1.arcgis.com/j6iFLXhyiD3XTMyD/arcgis/rest/services/NoCondoParcels_RelatesBothWays/FeatureServer/0",
  // });

  // const CondosLayer = new FeatureLayer({
  //   url: "https://services1.arcgis.com/j6iFLXhyiD3XTMyD/arcgis/rest/services/CondoParcels_RelatesBothWays/FeatureServer/0",
  // });

  const popupTemplate = {
    title: "{Street_Name} in {Location}", // Customize the title as needed
    content: [
      {
        type: "fields",
        fieldInfos: [
          {
            fieldName: "Street_Name",
            label: "Street Name",
          },
          {
            fieldName: "MBL",
            label: "MBL",
          },
          {
            fieldName: "Location",
            label: "Location",
          },
          {
            fieldName: "Co_Owner",
            label: "Co-Owner",
          },
          {
            fieldName: "Uniqueid",
            label: "Unique ID",
          },
          {
            fieldName: "Owner",
            label: "Owner",
          },
          {
            fieldName: "GIS_LINK",
            label: "GIS Link",
          },
          // Add more fieldInfos for additional fields if needed
        ],
      },
    ],
  };

  const CondosTable = new FeatureLayer({
    url: "https://services1.arcgis.com/j6iFLXhyiD3XTMyD/arcgis/rest/services/CondoParcels_RelatesBothWays/FeatureServer/1",
    popupTemplate: popupTemplate,
  });

  const noCondosTable = new FeatureLayer({
    url: "https://services1.arcgis.com/j6iFLXhyiD3XTMyD/arcgis/rest/services/NoCondoParcels_RelatesBothWays/FeatureServer/1",
    popupTemplate: popupTemplate,
  });

  let runQuerySearchTerm;
  let clickedToggle;
  let handle1;
  let handle2;
  let firstList = [];
  let secondList = [];

  console.log(handle1);
  console.log(handle2);
  // Filtering out items from secondList that exist in firstList

  const clearBtn = document.getElementById("clear-btn");

  clearBtn.addEventListener("click", function () {
    $("#searchInput").val = "";
    // Get a reference to the search input field
    const searchInput = document.getElementById("searchInput");

    // To clear the text in the input field, set its value to an empty string
    searchInput.value = "";
    firstList = [];
    secondList = [];

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

    noCondosLayer.queryFeatures(query).then(function (result) {
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
      const features = result.features;
      features.forEach(function (feature) {
        console.log(feature);

        // PUT BACK TO FILTER OUT EMPTY OWNERS
        // if (feature.attributes.Owner === "") {
        //   return;
        // } else {
        // secondList.push(feature.attributes["Uniqueid"]);
        console.log("Detailed feature:", feature.attributes.Location);

        let locationVal = feature.attributes.Location;
        let locationUniqueId = feature.attributes["Uniqueid"];
        let locationGISLINK = feature.attributes["GIS_LINK"];
        let locationCoOwner = feature.attributes["Co_Owner"];
        let locationOwner = feature.attributes["Owner"];
        let locationMBL = feature.attributes["MBL"];
        let locationGeom = feature.geometry;

        firstList.push(
          new CondoTableElements(
            locationVal,
            locationMBL,
            locationUniqueId,
            locationCoOwner,
            locationOwner,
            locationGISLINK,
            locationGeom
          )
        );
        // }
      });
      console.log(firstList);

      const totalList = new Set(firstList);
      console.log(totalList);

      let seenIds = new Set();

      let uniqueArray = firstList.filter((obj) => {
        if (seenIds.has(obj.uniqueId)) {
          return false;
        } else {
          seenIds.add(obj.uniqueId);
          return true;
        }
      });

      // console.log(uniqueArray);

      uniqueArray.forEach(function (feature) {
        console.log(feature);

        let locationVal = feature.location;
        let locationUniqueId = feature.uniqueId;
        let locationGISLINK = feature.GIS_LINK;
        let locationCoOwner = feature.Co_Owner;
        let locationOwner = feature.owner;
        let locationMBL = feature.MBL;

        const imageUrl = `https://publicweb-gis.s3.amazonaws.com/Images/Bldg_Photos/Washington_CT/${locationUniqueId}.jpg`;

        const featureWidDiv = document.getElementById("dropdown");
        const listGroup = document.createElement("ul");
        // listGroup.classList.add("list-group");
        listGroup.classList.add("row");

        const listItem = document.createElement("li");
        const imageDiv = document.createElement("li");
        imageDiv.innerHTML = `<img src="${imageUrl}" alt="Image of ${locationUniqueId}" >`;
        listItem.classList.add("list-group-item", "col-9");
        imageDiv.classList.add("image-div", "col-3");

        let listItemHTML = `<strong>Location:</strong> ${locationVal} <br> <strong>Unique ID:</strong> ${locationUniqueId}<br> <strong>Owner: ${locationOwner}</strong>`;
        // let listItemHTML = `Location: ${locationVal} <br> Unique ID: ${locationUniqueId} <br> GIS_LINK: ${locationGISLINK}<br> Co-Owner: ${locationCoOwner} <br> Owner: ${locationOwner} <br> MBL: ${locationMBL}`;
        // Append the new list item to the list
        listItem.innerHTML += listItemHTML;

        // listItem.textContent = `Location: ${locationVal}, Unique ID: ${locationUniqueId}, GIS_LINK: ${locationGISLINK}
        //   Co-Owner: ${locationCoOwner}, Owner: ${locationOwner}, MBL: ${locationMBL}`;
        listItem.setAttribute("data-id", locationGISLINK);

        listGroup.appendChild(imageDiv);
        listGroup.appendChild(listItem);
        featureWidDiv.appendChild(listGroup);
        $("#dropdown").toggleClass("expanded");
        $("#dropdown").show();
      });

      $(document).ready(function () {
        $("li").on("click", function (e) {
          console.log(e);
          let itemId = e.target.getAttribute("data-id");
          // console.log(item);
          // const items = item.split(",");
          // itemUniqueID = items[1];
          // const itemId = itemUniqueID.split(":")[1];
          zoomToFeature(itemId);
        });
      });

      function zoomToFeature(itemId) {
        console.log(itemId);
        let matchingObject = firstList.filter(
          (obj) => obj.GIS_LINK == itemId || obj.Uniqueid == itemId
        );
        if (matchingObject) {
          matchingObject.forEach(function (feature) {
            console.log(feature);
            let geometry = feature.geometry;
            // Use the geometry to zoom to the feature.
            view.goTo(geometry);
          });
        }
      }
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

    if (searchTerm.length < 3) {
      return;
    } else {
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
              // if (feature.attributes.Co_Owner === "") {
              //   return;
              // } else {
              // firstList.push(feature.attributes["Uniqueid"]);
              // streetName, MBL, location, coOwner, uniqueId, owner
              console.log("Detailed feature:", feature.attributes.Location);

              let locationVal = feature.attributes.Location;
              let locationUniqueId = feature.attributes["Uniqueid"];
              let locationGISLINK = feature.attributes["GIS_LINK"];
              let locationCoOwner = feature.attributes["Co_Owner"];
              let locationOwner = feature.attributes["Owner"];
              let locationMBL = feature.attributes["MBL"];

              firstList.push(
                new CondoTableElements(
                  locationVal,
                  locationMBL,
                  locationUniqueId,
                  locationCoOwner,
                  locationOwner,
                  locationGISLINK
                )
              );
              // }
            });

            console.log(firstList);
          }
        })
        .catch((error) => {
          console.error("Error querying for details:", error);
        });
    }

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
