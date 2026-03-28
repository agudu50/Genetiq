import styles from "./SelectInput.module.scss";
// import DownCarretIcon from "@assets/Miscs/Icons/down-carret.svg";
const SelectInput = () => {
	return (
		<label htmlFor='dashboard-select' className={styles["Dashboard-select"]}>
			<select
				id='dashboard-select'
				name='options'
				className={styles["custom-select"]}
			>
				<option value='1'>Total Health</option>
				<option value='2'>2</option>
				<option value='3'>3</option>
				<option value='4'>4</option>
			</select>
			{/* <div className={styles["Dashboard-select-icon"]} for='dashboard-select'>
				<img src={DownCarretIcon} height={16} width={16} />
			</div> */}
		</label>
	);
};

export default SelectInput;
