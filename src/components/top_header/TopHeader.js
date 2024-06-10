import "./TopHeader.css";
import "../fileHandling/UploadFile.css";
import { useState } from "react";
//import NodeRiskColor from "../treeNode/NodeColorHelper";

// pop up window controllers
// TODO: Change to handle all buttons
//uncomment this after the bug is fixed
/*
document.addEventListener("DOMContentLoaded",() =>{
    const button = document.querySelector(".main-button")
    button.addEventListener("click", handleClick)
})

function handleClick(event){
    const modal = document.querySelector(".modal")
    const closeBtn = document.querySelector(".close")
    modal.style.display = "block";
    closeBtn.addEventListener("click", () => {
        modal.style.display = "none";
    })
}
*/

// class btn controls the pop up for the color changer
// class modal will allow the user to change which colors they want

// TODO: Give each button a value

export function TopHeader() {
  const [showListLayout, setShowListLayout] = useState(false);
  const toggleListLayout = () => {
    setShowListLayout(!showListLayout);
  };
  const handleColorModalOpen = () => {
    const colorModal = document.querySelector(".color-modal");
    colorModal.style.display = "block";
  };

  const handleLayoutModalOpen = () => {
    const layoutModal = document.querySelector(".layout-modal");
    layoutModal.style.display = "block";
  };

  const handleCloseModal = () => {
    const modals = document.querySelectorAll(".modal");
    modals.forEach((modal) => {
      modal.style.display = "none";
    });
  };

  return (
    <>
      {/* Ziyi: comment rn for the 1st demo, will implement this feature later
                <button className="main-button" onClick={handleColorModalOpen}>
                    Color Changer
                </button>
                */}
                {/* remove the button, rn using dropdown menu and links
                <button className="main-button" onClick={handleLayoutModalOpen}>
                    Layout Options
                </button>
                */}


            {/* <div className="modal color-modal">
                <div className="modal_content">
                    <span className="close" onClick={handleCloseModal}>&times;</span>
                    <h1>Change the colors</h1>
                    <button className="color-btn">Change Severe Color</button>
                    <button className="color-btn">Change High Color</button>
                    <button className="color-btn">Change Elevated Color</button>
                    <button className="color-btn">Change Guarded Color</button>
                    <button className="color-btn">Change Low Color</button>
                </div>
            </div>
            */}

            <div className="modal layout-modal">
                <div className="modal_content">
                    <span className="close" onClick={handleCloseModal}>&times;</span>
                    <h1>Layout Options</h1>
                    <button className="layout-btn-doing">Tree</button>
                    <button className="layout-btn-doing">List</button>
                    {/* 
                    <button onClick={toggleListLayout}>List</button>
                    <button className="layout-btn-todo">Columns</button>
                    <button className="layout-btn-todo">Icons</button>
                    <button className="layout-btn-todo">Galleries</button>
                    */}
                </div>
            </div>

      <div className="display-4" id="PIQUE_name">
        PIQUE Visualizer
      </div>
    </>
  );
}

/* add this back into the top header function once the bug is fixed
<div class="btn">
                <button class="main-button" onClick={(event) => handleClick(event)}>Color Changer</button>
            </div>

            <div class="modal">
                <div class="modal_content">
                    <span class="close" >&times;</span>
                    <h1>Change the colors</h1>
                    <button class="color-btn">Change Severe Color</button>
                    <button class="color-btn">Change High Color</button>
                    <button class="color-btn">Change Elevated Color</button>
                    <button class="color-btn">Change Gaurded Color</button>
                    <button class="color-btn">Change Low Color</button>
                </div>
            </div>
 */
