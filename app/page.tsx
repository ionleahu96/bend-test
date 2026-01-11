import styles from "./page.module.css";
import { AutoFillInput } from "./components/auto-fill-input";

export default function Main() {
  return (
    <div className={styles.page}>
      <AutoFillInput />
    </div>
  );
}
