import css from './TruncatedName.module.css'

const TruncatedName = ({ name, maxWidth = '300px' }) => {
    return (
        <div
            className={css.truncatedName}
            style={{ maxWidth: maxWidth }}
      title={name}
    >
      {name}
    </div>
  );
};

export default TruncatedName;