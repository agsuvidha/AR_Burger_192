AFRAME.registerComponent('create-markers',{
    init:async function(){
       var mainScene=document.querySelector('#main-scene')

       var dishes=await this.getDishes()

       dishes.map(dish=>{
          alert(JSON.stringify(dish.id))
          
          var marker=document.createElement("a-marker")
           marker.setAttribute("id",dish.id)
           marker.setAttribute("type","pattern")
           marker.setAttribute("url",dish.marker_pattern)
           marker.setAttribute("cursor",{
               rayOrigin:"mouse"
           })
           marker.setAttribute("marker-handler",{})
           mainScene.appendChild(marker)
           
        var model=document.createElement("a-entity")
        model.setAttribute("id",`model-${dish.id}`)
        model.setAttribute("position",dish.model_geometry.position)
        model.setAttribute("rotation",dish.model_geometry.rotation)
        model.setAttribute("scale",dish.model_geometry.scale)
        model.setAttribute("gltf-model",`url(${dish.model_url})`)
        model.setAttribute("gesture-handler",{})
        marker.appendChild(model)

        var plane=document.createElement("a-plane")
        plane.setAttribute("id",`plane-${dish.id}`)
        plane.setAttribute("position",{x:0,y:0,z:0})
        plane.setAttribute("rotation",{x:-90,y:0,z:0})
        plane.setAttribute("width",1.7)
        plane.setAttribute("height",1.5)
        marker.appendChild(plane)

        var tplane=document.createElement("a-plane")
        tplane.setAttribute("id",`tplane-${dish.id}`)
        tplane.setAttribute("position",{x:0,y:0.8,z:0})
        tplane.setAttribute("rotation",{x:-90,y:0,z:0})
        tplane.setAttribute("width",1.7)
        tplane.setAttribute("height",0.6)
        tplane.setAttribute("material",{color:"blue"})
        plane.appendChild(tplane)
        
        var disht=document.createElement("a-entity")
        disht.setAttribute("id",`disht-${dish.id}`)
        disht.setAttribute("position",{x:0,y:0,z:0})
        disht.setAttribute("rotation",{x:0,y:0,z:0})
        disht.setAttribute("text",{
            font:"monoid",color:"red",width:2,height:2.5,align:"center",value:dish.dish_name.toUpperCase()
        })
        tplane.appendChild(disht)

        var ingridients=document.createElement("a-entity")
        ingridients.setAttribute("id",`ingredients-${dish.id}`)
        ingridients.setAttribute("position",{x:0.5,y:0,z:0.1})
        ingridients.setAttribute("rotation",{x:0,y:0,z:0})
        ingridients.setAttribute("text",{
            font:"monoid",color:"blue",width:2,height:1,align:"left",value:`${dish.ingridients.join("\n")}`
        })
        plane.appendChild(ingridients)
        var ratingPlane = document.createElement("a-entity");
        ratingPlane.setAttribute("id", `rating-plane-${dish.id}`);
        ratingPlane.setAttribute("position", { x: 2, y: 0, z: 0.5 });
        ratingPlane.setAttribute("geometry", {
          primitive: "plane",
          width: 1.5,
          height: 0.3
        });

        ratingPlane.setAttribute("material", {
          color: "#F0C30F"
        });
        ratingPlane.setAttribute("rotation", { x: -90, y: 0, z: 0 });
        ratingPlane.setAttribute("visible", false);

        // Ratings
        var rating = document.createElement("a-entity");
        rating.setAttribute("id", `rating-${dish.id}`);
        rating.setAttribute("position", { x: 0, y: 0.05, z: 0.1 });
        rating.setAttribute("rotation", { x: 0, y: 0, z: 0 });
        rating.setAttribute("text", {
          font: "mozillavr",
          color: "black",
          width: 2.4,
          align: "center",
          value: `Customer Rating: ${dish.last_rating}`
        });

        ratingPlane.appendChild(rating);
        marker.appendChild(ratingPlane);

        // Dish review plane
        var reviewPlane = document.createElement("a-entity");
        reviewPlane.setAttribute("id", `review-plane-${dish.id}`);
        reviewPlane.setAttribute("position", { x: 2, y: 0, z: 0 });
        reviewPlane.setAttribute("geometry", {
          primitive: "plane",
          width: 1.5,
          height: 0.5
        });

        reviewPlane.setAttribute("material", {
          color: "#F0C30F"
        });
        reviewPlane.setAttribute("rotation", { x: -90, y: 0, z: 0 });
        reviewPlane.setAttribute("visible", false);

        // Dish review
        var review = document.createElement("a-entity");
        review.setAttribute("id", `review-${dish.id}`);
        review.setAttribute("position", { x: 0, y: 0.05, z: 0.1 });
        review.setAttribute("rotation", { x: 0, y: 0, z: 0 });
        review.setAttribute("text", {
          font: "mozillavr",
          color: "black",
          width: 2.4,
          align: "center",
          value: `Customer Review: \n${dish.last_review}`
        });
        
        reviewPlane.appendChild(review);
        marker.appendChild(reviewPlane);
       })

       
    },
    getDishes:async function(){
        return await firebase
        .firestore()
        .collection("dishes")
        .get()
    .then(snap=>{
        console.log(snap.docs.map(doc => doc.data()))

        return snap.docs.map(doc=>doc.data())
    })    }

})