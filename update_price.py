#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
SNABGEAR — Автономный скрипт обновления прайса и остатков оборудования TecEner.
Извлекает актуальные цены (РРЦ), складские остатки и фото товаров из Excel (.xlsx),
обновляет public/data/price.json и автоматически пушит изменения в репозиторий.
"""

import os
import sys
import json
import re
import io
import shutil
import subprocess
import threading
from pathlib import Path
from datetime import datetime

import tkinter as tk
from tkinter import ttk, messagebox, filedialog, scrolledtext


def get_repo_root() -> Path:
    """Определяет корень проекта относительно исполняемого файла или скрипта."""
    # Если запущено из PyInstaller onefile
    if getattr(sys, "frozen", False) and hasattr(sys, "_MEIPASS"):
        # exe находится в корне или tools
        exe_dir = Path(sys.executable).resolve().parent
        if (exe_dir / "public" / "data").exists():
            return exe_dir
        if (exe_dir.parent / "public" / "data").exists():
            return exe_dir.parent
        return exe_dir

    script_dir = Path(__file__).resolve().parent
    if (script_dir / "public" / "data").exists():
        return script_dir
    if (script_dir.parent / "public" / "data").exists():
        return script_dir.parent
    return Path.cwd()


class PriceUpdaterGUI(tk.Tk):
    def __init__(self):
        super().__init__()

        self.repo_root = get_repo_root()
        self.price_json_path = self.repo_root / "public" / "data" / "price.json"
        self.images_dir = self.repo_root / "public" / "images" / "products"

        # Настройки окна
        self.title("SNABGEAR — Обновление прайса TecEner")
        self.geometry("580x420")
        self.minsize(540, 380)

        # Темная индустриальная тема
        self.bg_color = "#1e1e24"
        self.fg_color = "#f3f4f6"
        self.accent_orange = "#ff6b00"
        self.accent_orange_hover = "#ea580c"
        self.console_bg = "#121216"
        self.console_fg = "#10b981"  # Emerald terminal green

        self.configure(bg=self.bg_color)
        self.is_processing = False

        self._build_ui()
        self.log_msg(f"Репозиторий: {self.repo_root.name}")
        self.log_msg("Готов к работе. Выберите файл прайса поставщика (.xlsx)...")

    def _build_ui(self):
        # Header container
        header_frame = tk.Frame(self, bg=self.bg_color, padx=16, pady=12)
        header_frame.pack(fill=tk.X)

        title_lbl = tk.Label(
            header_frame,
            text="SNABGEAR · ОБНОВЛЕНИЕ ПРАЙСА TECENER",
            font=("Segoe UI", 12, "bold"),
            fg="#FFFFFF",
            bg=self.bg_color,
        )
        title_lbl.pack(anchor=tk.W)

        sub_lbl = tk.Label(
            header_frame,
            text="Импорт РРЦ, складских остатков и фото из Excel с автопушем на сайт",
            font=("Segoe UI", 8),
            fg="#9ca3af",
            bg=self.bg_color,
        )
        sub_lbl.pack(anchor=tk.W, pady=(2, 0))

        # Main Orange Action Button
        btn_frame = tk.Frame(self, bg=self.bg_color, padx=16, pady=6)
        btn_frame.pack(fill=tk.X)

        self.action_btn = tk.Button(
            btn_frame,
            text="Выбрать файл прайса и обновить сайт",
            font=("Segoe UI", 11, "bold"),
            bg=self.accent_orange,
            fg="#FFFFFF",
            activebackground=self.accent_orange_hover,
            activeforeground="#FFFFFF",
            relief=tk.FLAT,
            bd=0,
            padx=16,
            pady=10,
            cursor="hand2",
            command=self.start_update_process,
        )
        self.action_btn.pack(fill=tk.X)

        # Progress / Status Text
        log_label = tk.Label(
            self,
            text="Журнал операций:",
            font=("Segoe UI", 8, "bold"),
            fg="#d1d5db",
            bg=self.bg_color,
            anchor=tk.W,
            padx=16,
        )
        log_label.pack(fill=tk.X, pady=(6, 2))

        # Scrollable Console Area
        console_frame = tk.Frame(self, bg=self.bg_color)
        console_frame.pack(fill=tk.BOTH, expand=True, padx=16, pady=(0, 12))

        self.log_area = scrolledtext.ScrolledText(
            console_frame,
            bg=self.console_bg,
            fg=self.console_fg,
            insertbackground="#FFFFFF",
            font=("Consolas", 9),
            relief=tk.FLAT,
            bd=1,
            padx=8,
            pady=8,
        )
        self.log_area.pack(fill=tk.BOTH, expand=True)

    def log_msg(self, msg: str):
        """Безопасный вывод сообщения в консоль с прокруткой вниз."""
        timestamp = datetime.now().strftime("%H:%M:%S")
        formatted = f"[{timestamp}] {msg}\n"
        self.log_area.configure(state=tk.NORMAL)
        self.log_area.insert(tk.END, formatted)
        self.log_area.see(tk.END)
        self.log_area.configure(state=tk.DISABLED)

    def start_update_process(self):
        if self.is_processing:
            return

        file_path = filedialog.askopenfilename(
            title="Выберите прайс-лист TecEner (.xlsx)",
            filetypes=[("Таблицы Excel", "*.xlsx"), ("Все файлы", "*.*")],
        )

        if not file_path:
            return

        self.is_processing = True
        self.action_btn.configure(state=tk.DISABLED, bg="#4b5563")

        # Запуск в фоновом потоке, чтобы GUI не зависал
        thread = threading.Thread(
            target=self._process_file,
            args=(Path(file_path),),
            daemon=True,
        )
        thread.start()

    def _process_file(self, excel_path: Path):
        try:
            self.log_msg(f"Выбран файл: {excel_path.name}")

            # Проверка наличия openpyxl
            try:
                import openpyxl
            except ImportError:
                self.log_msg("ОШИБКА: Требуется библиотека openpyxl. Установите: pip install openpyxl")
                messagebox.showerror(
                    "Ошибка",
                    "Для работы требуется библиотека openpyxl.\nУстановите её командой:\npip install openpyxl pillow",
                )
                return

            self.log_msg("Чтение данных из файла Excel...")
            wb = openpyxl.load_workbook(excel_path, data_only=True)
            sheet = wb.active

            # 1. Загрузка существующего price.json для сохранения характеристик и фото
            existing_items = []
            if self.price_json_path.exists():
                try:
                    with open(self.price_json_path, "r", encoding="utf-8") as f:
                        existing_items = json.load(f)
                    self.log_msg(f"Загружено текущих позиций из базы: {len(existing_items)}")
                except Exception as e:
                    self.log_msg(f"Предупреждение: Не удалось прочитать старый price.json: {e}")

            prod_map = {str(item.get("sku", "")).strip(): item for item in existing_items}

            # 2. Определение колонок (SKU, Название, РРЦ, Остаток)
            header_row_idx = None
            col_map = {}

            # Ищем строку с заголовками в первых 12 строках
            for row_idx in range(1, min(15, sheet.max_row + 1)):
                row_vals = [str(cell.value or "").strip().lower() for cell in sheet[row_idx]]
                row_str = " ".join(row_vals)

                # Проверка наличия ключевых слов
                has_sku = any(k in row_str for k in ["артикул", "sku", "код"])
                has_name = any(k in row_str for k in ["наименование", "название", "модель", "номенклатура"])
                has_price = any(k in row_str for k in ["ррц", "рознич", "цена", "стоимость"])

                if (has_sku or has_name) and has_price:
                    header_row_idx = row_idx
                    for col_idx, cell_text in enumerate(row_vals, start=1):
                        # СТРОГО игнорируем колонки закупки/себестоимости
                        is_purchase = any(
                            p in cell_text
                            for p in ["закуп", "дилер", "вход", "опт", "себестоим", "партнер", "базов", "cost"]
                        )
                        if is_purchase:
                            continue

                        if any(k in cell_text for k in ["артикул", "sku"]) and "sku" not in col_map:
                            col_map["sku"] = col_idx
                        elif "код" in cell_text and "sku" not in col_map:
                            col_map["sku"] = col_idx
                        elif any(k in cell_text for k in ["наименование", "название", "модель"]) and "title" not in col_map:
                            col_map["title"] = col_idx
                        elif any(k in cell_text for k in ["ррц", "рознич"]):
                            col_map["price"] = col_idx  # приоритет РРЦ
                        elif "цена" in cell_text and "price" not in col_map:
                            col_map["price"] = col_idx
                        elif any(k in cell_text for k in ["остаток", "наличие", "склад", "кол-во", "колво", "qty"]):
                            col_map["stock"] = col_idx
                        elif any(k in cell_text for k in ["характеристик", "параметр", "описание"]):
                            col_map["specs"] = col_idx
                    break

            if not header_row_idx or "price" not in col_map:
                self.log_msg("Ошибка: Не удалось найти колонки с ценой РРЦ и товарами в таблице.")
                messagebox.showerror(
                    "Ошибка структуры Excel",
                    "В файле не найдены заголовки колонок 'Артикул / Модель' и 'РРЦ'.\nПроверьте формат файла.",
                )
                return

            self.log_msg(f"Заголовки найдены на строке {header_row_idx}: {col_map}")

            # 3. Извлечение встроенных изображений из Excel
            self.images_dir.mkdir(parents=True, exist_ok=True)
            images_extracted = 0

            # Поиск изображений по строкам
            if hasattr(sheet, "_images"):
                self.log_msg(f"Поиск изображений в Excel (найдено блоков: {len(sheet._images)})...")
                for img in sheet._images:
                    try:
                        anchor_row = None
                        if hasattr(img, "anchor") and hasattr(img.anchor, "_from"):
                            anchor_row = img.anchor._from.row + 1
                        elif hasattr(img, "anchor") and hasattr(img.anchor, "row"):
                            anchor_row = img.anchor.row

                        if anchor_row and anchor_row > header_row_idx:
                            # Получаем артикул в этой строке
                            row_sku_cell = sheet.cell(row=anchor_row, column=col_map.get("sku", 1))
                            sku_val = str(row_sku_cell.value or "").strip()
                            if sku_val and sku_val.isdigit():
                                img_dest = self.images_dir / f"{sku_val}.png"

                                # Чтение байтов
                                img_bytes = None
                                if hasattr(img, "_data"):
                                    img_bytes = img._data()
                                elif hasattr(img, "ref") and hasattr(img.ref, "read"):
                                    img_bytes = img.ref.read()

                                if img_bytes:
                                    try:
                                        from PIL import Image

                                        pil_img = Image.open(io.BytesIO(img_bytes))
                                        pil_img.save(img_dest, "PNG")
                                        images_extracted += 1
                                    except Exception:
                                        with open(img_dest, "wb") as f_img:
                                            f_img.write(img_bytes)
                                        images_extracted += 1
                    except Exception as img_err:
                        pass

            if images_extracted > 0:
                self.log_msg(f"Извлечено и сохранено фото: {images_extracted} шт.")

            # 4. Обход строк и парсинг товаров
            updated_count = 0
            new_count = 0

            for r in range(header_row_idx + 1, sheet.max_row + 1):
                sku_raw = sheet.cell(row=r, column=col_map.get("sku", 1)).value
                title_raw = sheet.cell(row=r, column=col_map.get("title", 2)).value if "title" in col_map else ""
                price_raw = sheet.cell(row=r, column=col_map["price"]).value
                stock_raw = sheet.cell(row=r, column=col_map["stock"]).value if "stock" in col_map else 10
                specs_raw = sheet.cell(row=r, column=col_map["specs"]).value if "specs" in col_map else None

                if not sku_raw and not title_raw:
                    continue

                sku = str(sku_raw or "").strip()
                title = str(title_raw or "").strip()

                # Если артикул пустой, пробуем извлечь из названия
                if not sku and title:
                    sku_match = re.search(r"\b(111\d{4})\b", title)
                    if sku_match:
                        sku = sku_match.group(1)

                if not sku:
                    continue

                # Очистка цены
                clean_price = 0
                if price_raw is not None:
                    p_str = str(price_raw).replace(" ", "").replace("₽", "").replace(",", ".")
                    try:
                        clean_price = int(float(p_str))
                    except ValueError:
                        clean_price = 0

                # Очистка остатка
                clean_stock = 0
                if stock_raw is not None:
                    s_str = str(stock_raw).strip().lower()
                    if any(w in s_str for w in ["в наличии", "да", "+", "много"]):
                        clean_stock = 10
                    elif any(w in s_str for w in ["под заказ", "нет", "-", "0"]):
                        clean_stock = 0
                    else:
                        digits = re.findall(r"\d+", s_str)
                        clean_stock = int(digits[0]) if digits else 0

                # Проверка наличия изображения на диске
                img_path = f"images/products/{sku}.png"
                disk_img = self.images_dir / f"{sku}.png"
                if not disk_img.exists():
                    img_path = ""

                # Обновление или создание записи
                if sku in prod_map:
                    item = prod_map[sku]
                    if clean_price > 0:
                        item["price"] = clean_price
                    item["stock"] = clean_stock
                    if title and not item.get("title"):
                        item["title"] = title
                    if img_path:
                        item["image"] = img_path
                    updated_count += 1
                else:
                    new_item = {
                        "id": sku,
                        "sku": sku,
                        "title": title or f"Оборудование TecEner {sku}",
                        "specs": [specs_raw] if specs_raw else [],
                        "price": clean_price,
                        "stock": clean_stock,
                        "image": img_path,
                    }
                    prod_map[sku] = new_item
                    existing_items.append(new_item)
                    new_count += 1

            self.log_msg(f"Обработано позиций: обновлено {updated_count}, добавлено новых {new_count}")

            # 5. Сохранение public/data/price.json
            self.price_json_path.parent.mkdir(parents=True, exist_ok=True)
            backup_path = self.price_json_path.with_suffix(".json.bak")
            if self.price_json_path.exists():
                shutil.copyfile(self.price_json_path, backup_path)

            all_products = list(prod_map.values())
            with open(self.price_json_path, "w", encoding="utf-8") as f_out:
                json.dump(all_products, f_out, ensure_ascii=False, indent=2)

            self.log_msg(f"Файл {self.price_json_path.name} успешно сохранён ({len(all_products)} позиций).")

            # 6. Автоматический Git Commit & Push
            self.log_msg("Выполнение отправки в Git репозиторий...")
            self._git_commit_and_push()

            self.log_msg("ГОТОВО! Прайс обновлен и отправлен на сайт.")
            messagebox.showinfo(
                "Успех",
                "Готово! Прайс обновлен и отправлен на сайт.\n\n"
                f"Обновлено товаров: {updated_count + new_count}\n"
                f"Файл: public/data/price.json\n"
                "Сайт автоматически подхватит изменения при обновлении GitHub Pages.",
            )

        except Exception as err:
            self.log_msg(f"ОШИБКА: {err}")
            messagebox.showerror("Ошибка выполнения", f"Произошла ошибка:\n{err}")
        finally:
            self.is_processing = False
            self.action_btn.configure(state=tk.NORMAL, bg=self.accent_orange)

    def _git_commit_and_push(self):
        """Выполняет git add, commit и push."""
        try:
            # 1. git add
            cmd_add = ["git", "add", "public/data/price.json", "public/images/products/"]
            self.log_msg(f"> {' '.join(cmd_add)}")
            res_add = subprocess.run(cmd_add, cwd=self.repo_root, capture_output=True, text=True)
            if res_add.stderr and res_add.returncode != 0:
                self.log_msg(f"Git add: {res_add.stderr.strip()}")

            # 2. git commit
            cmd_commit = ["git", "commit", "-m", "Автообновление прайса и остатков"]
            self.log_msg(f"> {' '.join(cmd_commit)}")
            res_commit = subprocess.run(cmd_commit, cwd=self.repo_root, capture_output=True, text=True)
            if res_commit.stdout:
                self.log_msg(res_commit.stdout.strip())
            if "nothing to commit" in (res_commit.stdout + res_commit.stderr):
                self.log_msg("Нет изменений цен/остатков для коммита.")
                return

            # 3. git push
            cmd_push = ["git", "push"]
            self.log_msg(f"> {' '.join(cmd_push)}")
            res_push = subprocess.run(cmd_push, cwd=self.repo_root, capture_output=True, text=True)
            if res_push.stdout:
                self.log_msg(res_push.stdout.strip())
            if res_push.stderr:
                self.log_msg(res_push.stderr.strip())

        except Exception as git_err:
            self.log_msg(f"Предупреждение Git: {git_err}")


def main():
    app = PriceUpdaterGUI()
    app.mainloop()


if __name__ == "__main__":
    main()
