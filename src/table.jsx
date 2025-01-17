const NotesTable = ({ notes }) => {
  return (
    <div className="table">
      <div className="row header">
        <span>Name</span>
        <span>Description</span>
      </div>
      {notes.map((note) => (
        <div key={note.name} className="row">
          <span>{note.name}</span>
          <span>{note.description}</span>
        </div>
      ))}
    </div>
  );
};

export default NotesTable;
