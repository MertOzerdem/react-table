import './App.css';
import Table from './components/Table/Table.js'
import {tableData} from './components/dummyData';

function App() {
  const rowsPerPage = [
    [5,10,20],
    10
  ]

  return (
    <div className="App">
      <Table data={tableData} rowsPerPage={rowsPerPage}>
        <div>
          <button></button>
        </div>
      </Table>
    </div>
  );
}

export default App;
