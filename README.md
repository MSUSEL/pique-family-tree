<img src="./src/assets/PIQUE_svg.svg" width="100" height="100" alt="PIQUE Logo">

# PIQUE Visualizer
A React app used to visualize PIQUE results. In a hierachical tree display, the quality scores from\
PIQUE results are much easier to understand than trying to parse through complicated json files.

### Outline
1. [PIQUE Visualizer Introduction](#pique-visualizer)
2. [Input File Schema Requirements](#input-file-schema-requirements)
    - [Understanding "Record" in the Schema](#understanding-record-in-the-schema)
    - [General Dataset Structure](#general-dataset-structure)
    - [Factors](#factors)
    - [Measures](#measures)
    - [Diagnostics](#diagnostics)
    - [Utility Function Structure](#utility-function-structure)
    - [Compatibility Note](#compatibility-note)
3. [Using the Visualizer](#using-the-visualizer)
    - [File Upload](#file-upload)
    - [Initial Display](#initial-display)
    - [Viewing Children](#viewing-children)
    - [Viewing Parents](#viewing-parents)
    - [Information Panel](#information-panel)
4. [Setup](#setup)
    - [npm install](#npm-install)
    - [npm run dev](#npm-run-dev)
    - [npm run storybook](#npm-run-storybook)
5. [Funding Agency](#funding-agency)



## Input File Schema Requirements

To facilitate a smooth experience with our visualization tool, it's crucial that the input JSON file adheres to our defined schema. This section details the schema's requirements, highlighting required and optional fields along with their data types.


### Understanding "Record" in the Schema

In our schema descriptions, you'll often see the term `Record` used, such as `Record<string, string>` or `Record<string, number>`. A `Record` is a TypeScript type that represents an object with keys and values, where the key type is the first type parameter (often a `string`) and the value type is the second type parameter (e.g., `string`, `number`). This allows for flexible and dynamic object shapes where the exact keys do not need to be known in advance, but the types of the keys and values are strictly defined. For instance, `Record<string, string>` indicates an object with string keys and string values, such as `{ "key1": "value1", "key2": "value2" }`. This is useful for representing dictionaries or collections of items where the keys may vary but still conform to a specific type structure.


### General Dataset Structure

The dataset is structured as follows:

- `name`: `string` - The dataset's name.
- `global_config`: `Record<string, any>` - A record for global configuration settings.
- `factors`: `Record<Record<Factor>>` - A nested record structure for factors. 
- `measures`: `Record<Measure>` - A record of measures.
- `diagnostics`: `Record<Diagnostic>` - A record of diagnostic information.
- `additionalData`: `Record<string, any>` - A record for any additional data.

### Factors

Typically, there will be 3 types of `factors` ( `Record<>`): `tqi` (total quality index), `quality_aspects`, and `product_factors`, all of their types are  `Record<Factor>`. Factors in the dataset are defined as follows:

- `name`: `string` - The name of the factor.
- `value`: `number` - The value assigned to the factor.
- `eval_strategy`: `string` - The evaluation strategy.
- `normalizer`: `string` - Normalization method used.
- `utility_function`: `string | UtilityFunctionStructure` - The associated utility function.
- `description`: `string` - A description of the factor.
- `weights`: `Record<string, number>` - Weights for the factor.


### Measures

Each measure within the dataset is an object with the following fields:

- `description`: `string` - A brief description of the measure.
- `eval_strategy`: `string` - The evaluation strategy used.
- `normalizer`: `string` - The method used for normalization.
- `positive`: `boolean` - Indicates if the measure is positive.
- `thresholds`: `tuple[number, number]` - A tuple representing the range of acceptable values.
- `utility_function`: `string | UtilityFunctionStructure` - The utility function, either as a string or detailed structure.
- `value`: `number` - The value associated with the measure.
- `weights`: `Record<string, number>` - Weights assigned to various aspects of the measure.


### Diagnostics

Diagnostic information is captured in objects with these fields:

- `description`: `string` - A description of the diagnostic.
- `eval_strategy`: `string` - Evaluation strategy used.
- `name`: `string` - The name of the diagnostic.
- `normalizer`: `string` - Normalization method.
- `toolName`: `string` - The name of the tool used for diagnostics.
- `utility_function`: `string | UtilityFunctionStructure` - Associated utility function.
- `value`: `number` - The diagnostic's value.
- `weights`: `Record<string, number>` - Weights for the diagnostic.


### Utility Function Structure

The utility function is contained in Factors, Measures, and Diagnostics. It can be represented in two ways: as a simple string or as a detailed object. When detailed, it includes the following fields:

- **Required Fields:**
  - `name`: `string` - The name of the utility function.
  - `description`: `string` - A description of the utility function.
  
- **Optional Fields:**
  - `benchmarkTag`: `string?` - A tag associated with the benchmark.
  - `utilityFunctionImageURIs`: `Record<string, string>?` - A record of image URIs related to the utility function.
  - `benchmarkQualityMetrics`: `Record<string, string | number>?` - Quality metrics for the benchmark.
  - `utilityFunctionQualityMetrics`: `Record<string, string | number>?` - Quality metrics for the utility function itself.
  - `sensitivityAnalysisResults`: `Record<string, string | number>?` - Results from sensitivity analysis.


### Compatibility Note

For compatibility with our visualization tool, ensure your input file meticulously follows the schema detailed above. Adherence to this schema guarantees that the tool can accurately process and visualize your data.

---


# Using the Visualizer

### File Upload
PIQUE Visualizer accepts the compact json version of PIQUE results. These compact outputs are created by running\
original PIQUE results through an algorithm that reduces parent-child relationship redundancy, and significantly\
reduces the size of the json file while preserving the results.

<img src="https://github.com/MSUSEL/msusel-pique-visualizer/blob/refactorZiyi/src/assets/PIQUE-Visualizer-Pictures/refactored_file_upload.png" width="60%">


---
### Initial Display: Project Overview
Upon submitting the compact output of PIQUE, its results will be displayed on the screen. An overview\
of the evaluation results are displayed by default. In the overview tab, the users are able to visualize\
the distribution of project characteristics, factors, measures and diagnostics in terms of risk levels.

<img src="https://github.com/MSUSEL/msusel-pique-visualizer/blob/development/src/assets/PIQUE-Visualizer-Pictures/overview_tab.png" width="60%">
---

### Tree Display
Additionally, users are able to switch different tabs to select diaplay of the results. The first option\
is to display the results in a hierarchical tree structure that shows how the software quality score was created.

<img src="https://github.com/MSUSEL/msusel-pique-visualizer/blob/main/public/PIQUE-Visualizer-Pictures/initial_display.png" width="60%">

---

#### Viewing Children
Clicking on an applicable node (rectangle), its children and their respective edges will display on\
the screen. If these children are not already visible, they will be put into view. The edge weights will\
be shown along the edge.

<img src="https://github.com/MSUSEL/msusel-pique-visualizer/blob/main/public/PIQUE-Visualizer-Pictures/show_children.PNG" width="60%">

---

#### Viewing Parents
Clicking on the circle in the top left corner of a node will display its edges to the node's parents.\
The edge weights will be shown along the edge.

<img src="https://github.com/MSUSEL/msusel-pique-visualizer/blob/main/public/PIQUE-Visualizer-Pictures/show_parents.png" width="60%">

---

#### Information Panel
Clicking on the square in the top right corner of a node will display more information about the node in\
a side panel. Depending on what type of node it is will determine which information is shown, however almost\
all nodes will show a quality impact score showing how much they are bringing the total quality score down.

<img src="https://github.com/MSUSEL/msusel-pique-visualizer/blob/main/public/PIQUE-Visualizer-Pictures/show_side_panel.png" width="60%">

---

### List Display
Additionally, users are able to switch different tabs to select diaplay of the results. The second option\
is to display the results in a list structure that shows how the software quality score was created.

<img src="https://github.com/MSUSEL/msusel-pique-visualizer/blob/development/src/assets/PIQUE-Visualizer-Pictures/list_display.png" width="60%">


# Setup
Clone this repository to your local machine. You will also need node and npm installed on your computer.\
With the repository in your working directory, use the following commands:

### `npm install`
This will install all of the packages necessary for the visualizer. *Only need to use this command **one time***

### `npm run dev`

Runs the visualizer and opens it in your browser.\
Open [http://localhost:5173](http://localhost:5173) to view it in your browser.

<<<<<<< HEAD
### `npm run storybook`
Start storybook and open browser.
=======
>>>>>>> main

Funding Agency: [<img src="https://www.cisa.gov/profiles/cisad8_gov/themes/custom/gesso/dist/images/backgrounds/6fdaa25709d28dfb5cca.svg" width="20%" height="20%">](https://www.cisa.gov/)
