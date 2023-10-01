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

  const unitTable = new FeatureLayer({
    url: "https://services1.arcgis.com/j6iFLXhyiD3XTMyD/arcgis/rest/services/TESTRELATEFROMPARCELSTOTABLEONETOMANY/FeatureServer/1",
  });

  webmap.add(noCondosLayer);
  webmap.add(CondosLayer);

  unitTable.load().then(() => {
    webmap.tables.add(unitTable);
  });
  // webmap.add(unitTable);

  // const searchInput = document.getElementById("searchInput");

  // searchInput.addEventListener("input", function () {
  //   console.log("User input:", searchInput.value);
  // });

  // function getSuggestions(queryString) {
  //   layer = unitLayer;

  //   const query = layer.createQuery();
  //   query.returnGeometry = false; // We don't need geometry for suggestions
  //   query.outFields = ["*"];
  //   query.where = "Uniqueid = '%" + queryString + "%'";
  //   // query.where = "Uniqueid '%" + queryString + "%'";
  //   query.num = 5; // limit the number of suggestions

  //   layer
  //     .queryFeatures(query)
  //     .then(function (result) {
  //       console.log("Received suggestions:", result.features); // Log the suggestions

  //       // Later, we will populate the dropdown with these suggestions
  //     })
  //     .catch(function (error) {
  //       console.error("Error during query:", error); // Log any errors
  //     });
  // }

  // searchInput.addEventListener("input", function () {
  //   const userInput = searchInput.value;
  //   console.log("User input:", userInput);

  //   if (userInput.length > 2) {
  //     // consider querying only if user has typed more than 2 characters
  //     getSuggestions(userInput);
  //   }
  // });

  //   popupTemplate: {
  //     title: "{uniqueid}",
  //     outFields: ["*"],
  //     returnGeometry: true,
  //     type: "fields",
  //     content: [
  //       {
  //         type: "fields",
  //         fieldInfos: [
  //           {
  //             fieldName: "uniqueid",
  //             label: "Uniqueid",
  //           },
  //           {
  //             fieldName: "GIS_LINK",
  //             label: "GIS_LINK",
  //           },
  //           {
  //             fieldName: "Town_Code",
  //             label: "Town Code",
  //           },
  //           {
  //             fieldName: "Owner",
  //             label: "Owner",
  //           },
  //         ],
  //       },
  //     ],
  //   },
  // });
  // webmap.add(unitLayer);

  // const unitTable = new FeatureLayer({
  //   url: "https://services1.arcgis.com/j6iFLXhyiD3XTMyD/arcgis/rest/services/CT_Washington_Adv_Viewer_Parcels_NOCONDOS/FeatureServer/0",
  //   title: "CT Washington Adv Viewer Parcels NOCONDOS - Parcel Boundaries",
  //   outFields: ["*"],
  //   popupTemplate: {
  //     title: "{uniqueid}",
  //     outFields: ["*"],
  //     returnGeometry: true,
  //     fieldInfos: [
  //       {
  //         fieldName: "Uniqueid",
  //         label: "Uniqueid",
  //       },
  //       {
  //         fieldName: "GIS_LINK",
  //         label: "GIS_LINK",
  //       },
  //       {
  //         fieldName: "Town_Code",
  //         label: "Town Code",
  //       },
  //       {
  //         fieldName: "Owner",
  //         label: "Owner",
  //       },
  //       {
  //         fieldName: "Co_Owner",
  //         label: "Co Owner",
  //       },
  //       {
  //         fieldName: "Location",
  //         label: "Location",
  //       },
  //     ],
  //     content: [
  //       // Create RelationshipContent with the relationship between
  //       // the units and fires.
  //       {
  //         type: "relationship",
  //         // The numeric ID value for the defined relationship on the service.
  //         // This can be found on the service.
  //         relationshipId: 0,
  //       },
  //     ],
  //   },
  //   // Create a simple renderer with no fill and lighter outline.
  // });

  // Create the RelationshipContent popup element
  // const relationshipContent = new RelationshipContent({
  //   relationshipId: 0,
  //   title: "Cities in {Uniqueid}",
  //   description: "All the cities that reside in {Uniqueid}.",
  //   displayCount: 10,
  //   // Autocasts as new array of RelatedRecordsInfoFieldOrder objects
  //   orderByFields: [
  //     {
  //       field: "Uniqueid",
  //       order: "asc",
  //     },
  //   ],
  // });

  // Create the RelationshipContent popup element
  // and add it to the popup template content for the layer.
  // unitLayer.popupTemplate.content = [
  //   {
  //     // Autocasts as new RelationshipContent object
  //     type: "relationship",
  //     relationshipId: 0,
  //     title: "Hydrant Maintenance Inspections",
  //     description: "Hydrant maintenance inspections for {expression/asset}",
  //     displayCount: 5,
  //     // Autocasts as new array of RelatedRecordsInfoFieldOrder objects
  //     orderByFields: [
  //       {
  //         field: "Uniqueid",
  //         order: "desc",
  //       },
  //     ],
  //   },
  // ];

  // Create the non-spatial related table
  // const parcelsTable = new FeatureLayer({
  //   url: "https://services1.arcgis.com/j6iFLXhyiD3XTMyD/arcgis/rest/services/CT_Washington_Adv_Viewer_Parcels_NOCONDOS/FeatureServer/0",
  //   title: "Related Parcels",
  //   popupTemplate: {
  //     // Set up table's field information
  //     fieldInfos: [
  //       {
  //         fieldName: "Uniqueid",
  //         label: "Unique ID",
  //       },
  //       {
  //         fieldName: "Town_Code",
  //         label: "Town Code",
  //       },
  //       {
  //         fieldName: "GIS_LINK",
  //         label: "GIS Link",
  //       },
  //       {
  //         fieldName: "Owner",
  //         label: "Owner",
  //       },
  //       {
  //         fieldName: "Co_Owner",
  //         label: "Co Owner",
  //       },
  //     ],
  //   },
  // });

  // function queryPointFeatures(event) {
  //   const point = view.toMap(event);
  //   noCondosLayer
  //     .queryFeatures({
  //       //query object
  //       geometry: point,
  //       spatialRelationship: "intersects",
  //       returnGeometry: false,
  //       outFields: ["*"],
  //     })
  //     .then((featureSet) => {
  //       // set graphic location to mouse pointer and add to mapview
  //       pointGraphic.geometry = point;
  //       view.graphics.add(pointGraphic);
  //       // open popup of query result
  //       view.openPopup({
  //         location: point,
  //         features: featureSet.features,
  //       });
  //     });
  // }

  let highlight;
  let relatedResults = [];
  // LOGIC for click and query related records

  // view.on("click", (event) => {
  //   queryPointFeatures(event);
  // });

  function queryRelatedRecords(screenPoint) {
    console.log(screenPoint);
    const uniqueID = screenPoint;
    const point = view.toMap(screenPoint);

    noCondosLayer
      .queryObjectIds({
        where: `GIS_LINK = '${uniqueID}'`,
      })
      .then((objectIds) => {
        if (!objectIds.length) {
          console.log("No features found with GIS_LINK = 'J0001'");
          return;
        }

        // Next, query for related features using those objectIds
        const query = {
          outFields: ["*"],
          relationshipId: 0,
          objectIds: objectIds,
        };

        // Query the for the related features for the features ids found
        noCondosLayer
          .queryRelatedFeatures(query)
          .then(function (result) {
            const obj = result;
            console.log(obj);
            const value = obj[objectIds];
            const features = value.features;

            // const results = result.uniqueID;
            console.log(result);
            features.forEach(function (feature) {
              console.log(feature.attributes);

              const featureWidDiv = document.getElementById("dropdown");

              // Create a bootstrap list group
              const listGroup = document.createElement("ul");
              listGroup.classList.add("list-group");

              let value = feature.attributes["Uniqueid"];

              // Create a list item for the attribute
              const listItem = document.createElement("li");
              listItem.classList.add("list-group-item");
              listItem.textContent = `Parcel Unique ID: ${value}`;
              console.log(listItem);
              // Append the list item to the list group
              listGroup.appendChild(listItem);

              // Append the whole list group to the feature-wid div
              featureWidDiv.appendChild(listGroup);
              $("#dropdown").toggleClass("expanded");
            });
          })

          .catch(function (error) {
            console.log("error from queryRelatedFeatures", error);
          });
      });
  }

  function queryRelatedRecords2(screenPoint) {
    console.log(screenPoint);
    const uniqueID = screenPoint;
    const point = view.toMap(screenPoint);

    CondosLayer.queryObjectIds({
      where: `GIS_LINK = '${uniqueID}'`,
    }).then((objectIds) => {
      // Next, query for related features using those objectIds
      const query = {
        outFields: ["*"],
        relationshipId: 0,
        objectIds: objectIds,
      };

      // Query the for the related features for the features ids found
      CondosLayer.queryRelatedFeatures(query)
        .then(function (result) {
          const obj = result;

          let uniqueIds = [];

          for (let key in result) {
            let featureItem = result[key];

            // Check if features exist and has the required structure
            if (featureItem.features && featureItem.features.length > 0) {
              let attributes = featureItem.features[0].attributes;
              if (attributes && attributes.Uniqueid) {
                uniqueIds.push(attributes.Uniqueid);
              }
            }
          }

          uniqueIds.forEach(function (feature) {
            console.log(uniqueIds);

            const featureWidDiv = document.getElementById("dropdown");

            // Create a bootstrap list group
            const listGroup = document.createElement("ul");
            listGroup.classList.add("list-group");

            let value = feature;
            console.log(value);

            // Create a list item for the attribute
            const listItem = document.createElement("li");
            listItem.classList.add("list-group-item");
            listItem.textContent = `Parcel Unique ID: ${value}`;
            console.log(listItem);
            // Append the list item to the list group
            listGroup.appendChild(listItem);

            // Append the whole list group to the feature-wid div
            featureWidDiv.appendChild(listGroup);
            $("#dropdown").toggleClass("expanded");
          });
        })

        .catch(function (error) {
          console.log("error from queryRelatedFeatures", error);
        });
    });
  }

  const featuresWidget = new Features({
    container: "feature-wid",
    view: view,
  });

  const searchWidget = new Search({
    container: "searchContainer",
    view: view,
    allPlaceholder: "Search Parcels",
    includeDefaultSources: false,
    sources: [
      {
        layer: noCondosLayer,
        searchFields: [
          "UniqueId",
          "MBL",
          "Owner",
          "Co_Owner",
          "Location",
          "Street_Number",
        ],
        displayField: "GIS_LINK",
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
        ],
        displayField: "UniqueId",
        outFields: ["*"],
        name: "Parcels",
        placeholder: "Search Condo Parcels",
      },
    ],
  });

  // view.when(function () {
  //   webmap.load().then(function () {
  //     // Wait for all layers to be loaded
  //     let layersLoaded = webmap.layers.map((layer) => layer.load());
  //     // console.log(layersLoaded);
  //     // layersLoaded.reverse();

  //     // console.log(layersLoaded);
  //     Promise.all(layersLoaded).then(() => {
  //       console.log(webmap.layers);
  //       // const reversedLayers = webmap.layers.slice().reverse();
  //       const featureLayerSources = webmap.layers
  //         .filter(function (layer) {
  //           return layer.type === "feature" || layer.type === "Map Service";
  //         })
  //         .map(function (featureLayer) {
  //           const defaultSearchFields = featureLayer.fields
  //             .filter(
  //               (field) =>
  //                 field.type === "string" ||
  //                 field.type === "double" ||
  //                 field.type === "date"
  //             )
  //             .map((field) => field.name);

  //           let searchFields, displayField;

  //           {
  //             searchFields = [
  //               "UniqueId",
  //               "MBL",
  //               "Owner",
  //               "Co_Owner",
  //               "Location",
  //               "Street_Number",
  //             ];
  //             displayField = "GIS_LINK";
  //             // } else if (featureLayer.title === "Double Line Drawings") {
  //             //   searchFields = ["DRAWINGNUMBER"];
  //             //   displayField = "DRAWINGNUMBER";
  //             // } else {
  //             //   searchFields = ["OBG_COMMON_NAME", "OBG_DESC", "OBG_SYSTEM"];
  //             //   displayField = "OBG_DESC";
  //             // }
  //           }
  //           return {
  //             layer: featureLayer,
  //             searchFields: searchFields,
  //             displayField: displayField,
  //             outFields: ["*"],
  //             name: featureLayer.title,
  //             placeholder: "Search " + featureLayer.title,
  //             maxSuggestions: 6,
  //             maxResults: 6,
  //             searchAllEnabled: false,
  //             suggestionsEnabled: true,
  //             DefaultSources: false,
  //           };
  //         });
  //       // });
  //       let searchQuery = "";

  //       searchWidget.on("suggest-start", function (event) {
  //         if (!event.searchTerm.startsWith("%")) {
  //           searchQuery = `${event.searchTerm}`;
  //           searchWidget.searchTerm = searchQuery;
  //         } else {
  //           searchQuery = event.searchTerm;
  //         }
  //       });

  //       searchWidget.sources = featureLayerSources;
  //       console.log(searchWidget.sources);
  //       // searchWidget.sources.push(geocoder);
  //     });
  //   });
  // });
  // Adds the search widget below other elements in
  // the top left corner of the view
  view.ui.add(searchWidget, { position: "bottom-left" });
  view.ui.add(searchWidget2, { position: "bottom-left" });

  searchWidget.on("select-result", function (event) {
    // const featureWidDiv = document.getElementById("dropdown");
    $("#dropdown").empty();
    // featureWidDiv.removeChild(listGroup);

    $("#dropdown").toggleClass("expanded");

    if (event.result && event.result.feature) {
      const objectId = event.result.feature.attributes.GIS_LINK; // or your layer's unique ID field
      console.log(objectId);
      // Now query the related records based on this objectId
      queryRelatedRecords(objectId);
    }
  });

  searchWidget2.on("select-result", function (event) {
    $("#dropdown").empty();
    if (event.result && event.result.feature) {
      const objectId = event.result.feature.attributes.GIS_LINK; // or your layer's unique ID field
      console.log(objectId);
      // Now query the related records based on this objectId
      queryRelatedRecords2(objectId);
    }
  });

  // $(document).ready(function () {
  //   $("#refresh-search").on("click", function () {
  //     $("#dropdown").empty();
  //     $("#dropdown").toggleClass("expanded");
  //   });
  // });

  // const clearButton = $("#refresh-search");
  // view.ui.add(clearButton, { position: "top-right" });

  // reactiveUtils.on(
  //   () => view,
  //   "click",
  //   (event) => {
  //     featuresWidget.open({
  //       location: event.mapPoint,
  //       fetchFeatures: true,
  //     });
  //   }
  // );

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
