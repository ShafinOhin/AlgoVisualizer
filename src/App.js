import React from 'react';
import './App.css';

var gridDimension = [15, 35]
var itemStateArray = [];
var sourceItemId = 252;
var destinationItemId = 272;
var globalAlgoValue;
var currentSelectorState = 3;
var mouseisDown = false;
var globalDelay = 40;
var globalIsAlgoRunning = false;
var globalGridUpdaterID;

// ----- variables for algos ---------
var level = new Array(560).fill(99999);
var par = new Array(560);

var dx = [1, -1, 0, 0];
var dy = [0, 0, 1, -1];
var Queue = [];


const itemState = {
  unvisited: 0,
  visited: 1,
  current: 2,
  block: 3,
  source: 4,
  destination: 5,
  pathItem: 6,
};

const bgColors = [
  'white',
  'aqua',
  'crimson',
  'black',
  'chartreuse',
  'darkblue',
  'greenyellow',
];

function GlobalhandleMouseDown(e){
  mouseisDown = true;
}

function GlobalhandleMouseUp(e){
  mouseisDown = false;
}

function GlobalhandleMouseOut(e){
  //mouseisDown = false;  //TODO DEBUG THIS
}



function Item (props){
    var styles= {
      backgroundColor: bgColors[props.stateArray[props.id]],
    }
    return(
      <div className="item" id={props.id} 
        onClick={(e) => {props.itemCliked(e, props.id)}} 
        onMouseEnter={(e) => {props.handleMouseEnter(e, props.id)}} 
        onMouseDown = {(e) => {props.handleMouseDown(e, props.id)}} 
        onMouseUp = {(e) => {props.handleMouseUp(e, props.id)}} 
        style={styles}></div>
    );

}


function GridRow(props){
  var tempArray = new Array(props.rowLength).fill(1).map((x,i) => i);
  return <div className="row"> 
        {
          tempArray.map((x,i) => <Item 
            stateArray = {props.stateArray}
            itemCliked = {(e, id) => props.itemCliked(e, id)}
            handleMouseEnter = {(e, id) => props.handleMouseEnter(e, id)}
            handleMouseDown = {(e, id) => props.handleMouseDown(e, id)}
            handleMouseUp = {(e, id) => props.handleMouseUp(e, id)}
            key = {(props.rowNum*35 + i).toString()}
            id={(props.rowNum*35 + i).toString()} />)
        }
    </div>
}


function GridArea(props){

  var tempArray = new Array(props.dimension[0]).fill(1).map((x,i) => i);

    return <div className="grid-area">
        {
          tempArray.map((x,i) => <GridRow
            stateArray = {props.state.stateArray}
            key = {i}
            itemCliked = {props.handleItemClick}
            handleMouseEnter = {props.handleMouseEnter}
            handleMouseDown = {props.handleMouseDown}
            handleMouseUp = {props.handleMouseUp}
            rowLength = {props.dimension[1]}
            rowNum = {i} />)
        }
      </div>

}

function GridContainer(props){
  return <div className="grid-container" >
    <GridArea 
    handleItemClick = {props.handleItemClick}
    handleMouseDown = {props.handleMouseDown}
    handleMouseUp = {props.handleMouseUp}
    handleMouseEnter = {props.handleMouseEnter}
    state={props.state}
    dimension={props.dimension}/>
  </div>
}

function AlgorithmSelectForm(props){
    return <form className="algo-select-form">
      <label>Select an Algorithm: </label>
      <select value={props.algoValue} onChange={props.handleChange}>
        <option value="BFS">Breadth first search</option>
        <option value="DFS">Depth first search</option>
        <option value="DJK">Dijkstra</option>
      </select>
      <div className="start-button" onClick={props.startButtonClicked}>Start Visualize</div>
    </form>
    

}

function GridEditorSelectionForm(props){
  var styles = [
    {
      backgroundColor: 'Aquamarine',
    },
    {
      backgroundColor: 'darkkhaki',
    }
  ]

    return <div className="editorSelector">
      <button className="pushButton" onClick={props.handleSourceButtonClick} style={styles[props.state.sourceButton]}>Select Source</button>
      <button className="pushButton" onClick={props.handleDestinationButtonClick} style={styles[props.state.destinationButton]}>Select Destination</button>
      <button className="pushButton" onClick={props.handleAddBlockButtonClick} style={styles[props.state.blockButton]}>Add Blocks</button>
      <button className="pushButton" onClick={props.handleRemoveBlockButtonClick} style={styles[props.state.rmBlockButton]}>Remove Blocks</button>
      <button className="pushButton" onClick={props.handleClearGridButtonClick} style={styles[0]}>Clear Grid</button>
    </div>

}

function TopInputContainer(props){
    return <div className="top-input-container">
          <AlgorithmSelectForm 
            handleChange={props.handleAlgoChange}
              algoValue={props.state.algoValue}
              startButtonClicked={props.startButtonClicked}
            />
          <GridEditorSelectionForm 
            handleSourceButtonClick = {props.handleSourceButtonClick}
            handleDestinationButtonClick = {props.handleDestinationButtonClick}
            handleAddBlockButtonClick = {props.handleAddBlockButtonClick}
            handleRemoveBlockButtonClick = {props.handleRemoveBlockButtonClick}
            handleClearGridButtonClick = {props.handleClearGridButtonClick}
            state={props.state}
          />
      </div>
}

class RootContainer extends React.Component{
  constructor(props){
    super(props);
    //globalIsAlgoRunning = false;
    clearInterval(globalGridUpdaterID);
    globalGridUpdaterID = setInterval(this.gridUpdater, globalDelay/2);
    this.cc = 0;
    itemStateArray = new Array(560).fill(0);
    itemStateArray[sourceItemId] = itemState.source;
    itemStateArray[destinationItemId] = itemState.destination;
    this.state = {
      algoValue: 'BFS',
      sourceButton: 0,
      destinationButton: 0,
      blockButton: 1,
      rmBlockButton: 0,
      stateArray: itemStateArray,
    }
    currentSelectorState = 3;
    this.handleAlgoChange = this.handleAlgoChange.bind(this);
    this.handleSourceButtonClick = this.handleSourceButtonClick.bind(this);
    this.handleDestinationButtonClick = this.handleDestinationButtonClick.bind(this);
    this.handleAddBlockButtonClick = this.handleAddBlockButtonClick.bind(this);
    this.handleRemoveBlockButtonClick = this.handleRemoveBlockButtonClick.bind(this);
    this.handleClearGridButtonClick = this.handleClearGridButtonClick.bind(this);
    this.startButtonClicked = this.startButtonClicked.bind(this);

    this.handleItemClick = this.handleItemClick.bind(this);
    this.handleMouseDown = this.handleMouseDown.bind(this);
    this.handleMouseEnter = this.handleMouseEnter.bind(this);
    this.handleMouseUp = this.handleMouseUp.bind(this);

    this.updateArrayAndReRender = this.updateArrayAndReRender.bind(this);
  }

  // AlgoEditorSecton Handlers
  handleAlgoChange(event){
    if(globalIsAlgoRunning) return;
    this.setState({
      algoValue : event.target.value,
    });
    globalAlgoValue = event.target.value;
  }

  //Buttons Section Handlers
  handleSourceButtonClick(event){
    if(globalIsAlgoRunning) return;
    currentSelectorState = 4;
    this.setState({
      sourceButton: 1,
      destinationButton: 0,
      blockButton: 0,
      rmBlockButton: 0,
    });
    event.preventDefault();
  }

  handleDestinationButtonClick(event){
    if(globalIsAlgoRunning) return;
    currentSelectorState = 5;
    this.setState({
      sourceButton: 0,
      destinationButton: 1,
      blockButton: 0,
      rmBlockButton: 0,
    });
    event.preventDefault();
  }

  handleAddBlockButtonClick(event){
    if(globalIsAlgoRunning) return;
    currentSelectorState = 3;
    this.setState({
      sourceButton: 0,
      destinationButton: 0,
      blockButton: 1,
      rmBlockButton: 0,
    });
    event.preventDefault();
  }

  handleRemoveBlockButtonClick(event){
    if(globalIsAlgoRunning) return;
    currentSelectorState = 0;
    this.setState({
      sourceButton: 0,
      destinationButton: 0,
      blockButton: 0,
      rmBlockButton: 1,
    });
    event.preventDefault();
  }

  handleClearGridButtonClick(event){
    if(globalIsAlgoRunning) return;
    event.preventDefault();
    this.clearGrid();
  }

    clearGrid(){
      level = new Array(560).fill(99999);
      par = new Array(560);
      Queue = [];
      for(var ii=0; ii<560; ii++) itemStateArray[ii] = 0;
      itemStateArray[sourceItemId] = itemState.source;
      itemStateArray[destinationItemId] = itemState.destination;
      this.setState({
        itemState: itemStateArray,
      })
    }


  //GridClick Handler Functions
  handleItemClick(e, id){
    if(globalIsAlgoRunning) return;
    this.setState({
      stateArray: itemStateArray,
    });
  }

  handleMouseEnter(e, id){
    if(globalIsAlgoRunning) return;
    if(mouseisDown)
      this.updateState(id);
  }

  handleMouseDown(e, id){
    if(globalIsAlgoRunning) return;
    mouseisDown = true;
    e.preventDefault();
    this.updateState(id);
  }

  handleMouseUp(e, id){
    if(globalIsAlgoRunning) return;
    //mouseisDown = false;
  }

  updateState(id){
      switch(currentSelectorState){
        case 4:
          if(itemStateArray[id] !== 0) break;
          itemStateArray[sourceItemId] = itemState.unvisited;
          sourceItemId = id;
          itemStateArray[sourceItemId] = itemState.source;
          break;
        case 5:
          if(itemStateArray[id] !== 0) break;
          itemStateArray[destinationItemId] = itemState.unvisited;
          destinationItemId = id;
          itemStateArray[destinationItemId] = itemState.destination;
          break;
        case 3:
          if(itemStateArray[id] !== 0) break;
          itemStateArray[id] = itemState.block;
          break;
        case 0:
          if(id == sourceItemId || id == destinationItemId) break;
          itemStateArray[id] = itemState.unvisited;
          break;
        default:
          break;
      }
      this.setState({
        stateArray: itemStateArray,
      });
  }

  startButtonClicked(event){
    event.preventDefault();
    if(globalIsAlgoRunning) return;
    this.clearVisited();
    globalIsAlgoRunning = true;
    runBFS();
  }
    clearVisited(){
      level = new Array(560).fill(99999);
      par = new Array(560);
      Queue = [];
      for(var ii=0; ii<560; ii++) if(itemStateArray[ii] != itemState.block) 
        {itemStateArray[ii] = itemState.unvisited;}
      itemStateArray[sourceItemId] = itemState.source;
      itemStateArray[destinationItemId] = itemState.destination;
      this.setState({
        itemState: itemStateArray,
      })
    }

  gridUpdater = () => this.updateArrayAndReRender();

  updateArrayAndReRender(){
    var temp = itemStateArray[0];
    itemStateArray[0] = temp;
    this.setState({
      stateArray: itemStateArray,
    });
  }

  render(){
    if(globalIsAlgoRunning) console.log("Algo is running!!");
    //if(globalIsAlgoRunning == false) clearInterval(globalGridUpdaterID);
    return <div className="inside-root-container" 
                onMouseDown={(e) => GlobalhandleMouseDown(e)}
                onMouseUp={(e) => GlobalhandleMouseUp(e)}
                onMouseOut={(e) => GlobalhandleMouseOut(e)}>
      <TopInputContainer 
        handleSourceButtonClick = {(e) => this.handleSourceButtonClick(e)}
        handleDestinationButtonClick = {(e) => this.handleDestinationButtonClick(e)}
        handleAddBlockButtonClick = {(e) => this.handleAddBlockButtonClick(e)}
        handleRemoveBlockButtonClick = {(e) => this.handleRemoveBlockButtonClick(e)}
        handleClearGridButtonClick = {(e) => this.handleClearGridButtonClick(e)}
        handleAlgoChange = {(e) => this.handleAlgoChange(e)}
        state={this.state}
        startButtonClicked={(e) => this.startButtonClicked(e)}
      />
      <GridContainer 
        handleItemClick = {(e, id) => this.handleItemClick(e, id)}
        handleMouseDown = {(e, id) => this.handleMouseDown(e, id)}
        handleMouseUp = {(e, id) => this.handleMouseUp(e, id)}
        handleMouseEnter = {(e, id) => this.handleMouseEnter(e, id)}
        state={this.state}
        dimension={gridDimension}
      />
    </div>
  }

}

function App() {
  return (
      <RootContainer />
  );
}

export default App;


// Correct Till nowwwwwwwwwwwww



function getCoOrdinate(id){
  return [
    parseInt(id)%35,
    parseInt(parseInt(id)/35)
  ]
}

function getId(coOrdinate){
  return (coOrdinate[1])*35 + coOrdinate[0];
}




////////------------------------------ ----------- BFS ALgo -----------------------------

// ----------- variables for bfs -----------
var globalBFSIntervalID;
var globalBFSPathShowerID;
var finalPath = [];

function runBFS(){
  for(var tt=0; tt<560; tt++) par[tt] = tt;
  Queue.push(getCoOrdinate(sourceItemId));
  level[sourceItemId] = 0;
  console.log("BFS running");
  globalBFSIntervalID = setInterval(BFSNextStep, globalDelay);
}


function BFSNextStep(){
  if(Queue.length == 0) return;
  var cr = Queue.shift();
  var crID = getId(cr);
  //console.log(crID);
  for(var ii=0; ii<4; ii++){
    var [x, y] = [cr[0]+dx[ii], cr[1]+dy[ii]];
    var ID = getId([x,y]);
    if(ID == destinationItemId){
      clearInterval(globalBFSIntervalID);
      par[ID] = crID;
      showPath();
      console.log("Found! ", level[crID]+1);
      return;
    }
    if(x < gridDimension[1] && x>=0 && y<gridDimension[0] && y>=0){
      if(itemStateArray[ID] != itemState.visited && itemStateArray[ID] != itemState.block && ID != sourceItemId){
        itemStateArray[ID] = itemState.visited;
        Queue.push([x,y]);
        level[ID] = level[crID] + 1;
        par[ID] = crID;
        //gridUpdater();
        //Delay Needed!!!!!
      }
    }
  } 
}

function showPath(){
  var destCopy = destinationItemId;
  while(par[destCopy] != destCopy){
    finalPath.push(destCopy);
    destCopy = par[destCopy];
  }
  globalBFSPathShowerID = setInterval(updatePath, globalDelay);
}

function updatePath(){
  if(finalPath.length == 0){
    globalIsAlgoRunning = false;
    clearInterval(globalBFSPathShowerID);
    return;
  }
  console.log("updating path")
  var temp = finalPath.pop();
  itemStateArray[temp] = itemState.pathItem;
}
