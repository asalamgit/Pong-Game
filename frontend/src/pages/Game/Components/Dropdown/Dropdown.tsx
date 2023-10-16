import styles from './Dropdown.module.scss';

type Props = {
  title: string;
  value: string;
  handleChange: (event: React.ChangeEvent<HTMLSelectElement>) => void;
  options: { value: string; name: string }[];
};

const Dropdown = ({ title, value, handleChange, options }: Props) => {
  return (
    <div className={styles.dropdown}>
      <div className={styles.dropdownLabel}>
        <label>{title}</label>
      </div>
      <div className={styles.dropdownSelect}>
        <select value={value} onChange={handleChange}>
          {options.map((option, index) => (
            <option key={index} value={option.value}>
              {option.name}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default Dropdown;
