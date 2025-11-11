/* eslint-disable unused-imports/no-unused-imports */
/* eslint-disable import/order */
/* eslint-disable react/self-closing-comp */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react/jsx-sort-props */
/* eslint-disable padding-line-between-statements */
/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable no-unused-vars */
import { Fragment, useState } from "react";
import DataTable from "react-data-table-component";
import {
  ArrowLeft,
  ArrowRight,
  ChevronDown,
  Plus,
  Search,
} from "react-feather";
import ReactPaginate from "react-paginate";
import { HashLoader } from "react-spinners";
import { Input } from "reactstrap";
import NoData from "../noDataComponent";
import Select from "react-select";
import { components as SelectComponents } from "react-select";
import { DatePicker } from "antd";
import "../../styles/fontFamily.css";
import { noData } from "@/public/assets/icons/IndexIcons";
import Image from "next/image";

const ProductTable = ({
  rowHeading,
  data,
  columns,
  currentPage = 0, // Changed default to 0 for ReactPaginate
  showSearch,
  showFilter,
  setCurrentPage,
  totalPages = 0, // Renamed from count for clarity
  optionsData = [],
  setSelectedOption,
  isClearable = true,
  selectedOption,
  optionLoading,
  optionsPlaceholder = "Sort By",
  loading,
  isPagination = true,
  searchValue,
  setSearchValue,
  buttonClick,
  showButton,
  buttonText,
}) => {
  const defaultSelectedOption = optionsData.find(
    (option) => option.value === selectedOption
  );

  // Collapsible group state for react-select grouped options
  const [collapsedGroups, setCollapsedGroups] = useState({});
  const GroupHeading = (props) => {
    const { data } = props; // data.label for group label
    const isCollapsed =
      collapsedGroups[data.label] === undefined
        ? true
        : collapsedGroups[data.label];
    return (
      <div
        className="regular_font px-2 py-1 cursor-pointer select-none flex items-center gap-2"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setCollapsedGroups((prev) => ({
            ...prev,
            [data.label]: !(prev[data.label] === undefined
              ? true
              : prev[data.label]),
          }));
        }}
      >
        <span
          aria-hidden
          style={{
            display: "inline-flex",
            transition: "transform 0.2s ease",
            transform: `rotate(${isCollapsed ? -90 : 0}deg)`,
          }}
        >
          <ChevronDown size={14} />
        </span>
        {data.label}
      </div>
    );
  };
  const Group = (props) => {
    const { Heading, headingProps, label, children } = props;
    const isCollapsed =
      collapsedGroups[label] === undefined ? true : collapsedGroups[label];
    return (
      <div>
        <Heading {...headingProps} />
        {!isCollapsed && <div>{children}</div>}
      </div>
    );
  };

  // Control react-select menu visibility to keep it open during date interaction
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isInteractingWithDatePicker, setIsInteractingWithDatePicker] =
    useState(false);

  // Custom option to render a DatePicker inline for Due Date selection
  const CustomOption = (props) => {
    const { data } = props;
    if (data?.value !== "dueDate:select") {
      return <SelectComponents.Option {...props} />;
    }
    return (
      <div
        className="p-2"
        onMouseDown={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setIsMenuOpen(true);
        }}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
        }}
        onTouchStart={(e) => {
          e.preventDefault();
          e.stopPropagation();
        }}
      >
        <div className="regular_font mb-1">Select Due Date</div>
        <DatePicker
          size="small"
          allowClear
          onOpenChange={(open) => {
            // Keep the menu open while interacting with the calendar
            setIsInteractingWithDatePicker(open);
            if (open) setIsMenuOpen(true);
          }}
          onChange={(date) => {
            const value = date ? date.format("YYYY-MM-DD") : "";
            if (value) {
              setSelectedOption(`dueDate:${value}`);
            }
            // Keep menu open after picking or clearing
            setIsMenuOpen(true);
            setIsInteractingWithDatePicker(false);
          }}
        />
      </div>
    );
  };

  // console.log(defaultSelectedOption);

  const handleFilter = (e) => {
    const value = e.target.value;
    setSearchValue(value);
  };

  // Function to handle Pagination
  const handlePagination = (page) => {
    setCurrentPage(page.selected);
  };

  // Pagination Previous Component
  const Previous = () => {
    return (
      <Fragment>
        <ArrowLeft size={18} />
      </Fragment>
    );
  };

  // Pagination Next Component
  const Next = () => {
    return (
      <Fragment>
        <ArrowRight size={18} />
      </Fragment>
    );
  };

  // Custom Pagination
  const CustomPagination = () => (
    <div className="flex justify-center items-center p-2 direction_ltr">
      <ReactPaginate
        previousLabel={<Previous size={15} />}
        nextLabel={<Next size={15} />}
        forcePage={currentPage}
        onPageChange={handlePagination}
        pageCount={totalPages}
        breakLabel="..."
        pageRangeDisplayed={2}
        marginPagesDisplayed={2}
        activeClassName="active"
        pageClassName="page-item"
        breakClassName="page-item"
        nextLinkClassName="page-link"
        pageLinkClassName="page-link"
        breakLinkClassName="page-link"
        previousLinkClassName="page-link"
        nextClassName="page-item next-item"
        previousClassName="page-item prev-item"
        containerClassName="pagination regular_font react-paginate separated-pagination pagination-sm justify-end"
      />
    </div>
  );

  return (
    <>
      <Fragment>
        <div className="w-full rounded-xl">
          {/* Search and Filter Controls */}
          {(showSearch || showFilter || showButton) && (
            <div className="flex items-center justify-between flex-wrap pb-3 mt-2 gap-2 w-full rounded-xl">
              <div className="flex-1">
                {rowHeading && (
                  <h2 className="text-[1rem] text-white capitalize medium_font">
                    {rowHeading}
                  </h2>
                )}
              </div>{" "}
              {/* Spacer */}
              {showButton && (
                <button
                  className="custom_button w-full sm:w-auto"
                  onClick={buttonClick}
                >
                  <Plus size={18} className="medium_font" />
                  {buttonText}
                </button>
              )}
              {/* Search + Filter - Right Side */}
              <div className="flex gap-2 items-center flex-wrap w-full md:w-auto flex-md-nowarp">
                {showSearch && (
                  <div className="relative w-full md:max-w-[200px]">
                    <Search
                      size={18}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400"
                    />
                    <Input
                      className="dataTable-search md:w-auto py-[9px] pe-5 w-full regular_font"
                      type="text"
                      placeholder="Search"
                      value={searchValue}
                      onChange={handleFilter}
                      style={{
                        border: "1px solid #D9D9D9",
                        borderRadius: "10px",
                        padding: ".45rem 2.3rem .45rem .55rem",
                      }}
                    />
                  </div>
                )}

                {showFilter && (
                  <div className="custom_form w-full md:w-auto">
                    <Select
                      options={optionsData}
                      placeholder={optionsPlaceholder}
                      isClearable={isClearable}
                      components={{
                        IndicatorSeparator: () => null,
                        GroupHeading,
                        Group,
                        Option: CustomOption,
                      }}
                      closeMenuOnSelect={false}
                      menuIsOpen={isMenuOpen}
                      onMenuOpen={() => setIsMenuOpen(true)}
                      onMenuClose={() =>
                        setIsMenuOpen(
                          isInteractingWithDatePicker ? true : false
                        )
                      }
                      onChange={(option) =>
                        setSelectedOption(option ? option.value : "all")
                      }
                      isLoading={optionLoading}
                      isDisabled={optionLoading}
                      value={defaultSelectedOption}
                      styles={{
                        control: (provided, state) => ({
                          ...provided,
                          borderColor: "#ccc",
                          boxShadow: "none",
                          "&:hover": {
                            borderColor: "#D9D9D9",
                          },
                          borderRadius: "8px",
                          minHeight: "38px",
                          height: "auto",
                          fontSize: "14px",
                          transition: "all 0.3s ease",
                          paddingLeft: "8px",
                          paddingRight: "8px",
                          display: "flex",
                          width: "100%",
                          alignItems: "center",
                          backgroundColor: "white",
                        }),
                        option: (provided, state) => ({
                          ...provided,
                          backgroundColor: state.isSelected
                            ? "#6F222A"
                            : state.isFocused
                            ? "#f3e5e8"
                            : "white",
                          color: state.isSelected ? "white" : "black",
                          padding: 10,
                          cursor: "pointer",
                          fontSize: "14px",
                        }),
                        placeholder: (provided) => ({
                          ...provided,
                          color: "#999baa",
                        }),
                      }}
                      classNamePrefix="custom-input"
                      className="regular_font"
                    />
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="react-dataTable relative">
            <DataTable
              noHeader
              pagination={isPagination} // Only show pagination if there are multiple pages
              noDataComponent={
                !loading ? (
                  <NoData description={"No Data Found"} />
                ) : (
                  <div className="flex items-center py-10 h-52 gap-2 justify-center flex-col"></div>
                )
              }
              columns={columns}
              paginationPerPage={10}
              className="react-dataTable border-b-0 medium_font"
              sortIcon={<ChevronDown size={10} />}
              paginationComponent={CustomPagination}
              data={data}
              customStyles={{
                headRow: {
                  className: "medium_font",
                  style: {
                    backgroundColor: "#F6F4F0",
                    color: "#16161D",
                    borderRadius: "8px",
                  },
                },
                rows: {
                  style: {
                    backgroundColor: "#fff",
                    color: "#515355",
                    fontFamily: "var(--font-poppins)",
                    fontWeight: "400",
                    fontSize: "13px",
                  },
                },
                pagination: {
                  style: {
                    backgroundColor: "#1a1a2e",
                    color: "#16161D",
                    fontFamily: "var(--font-poppins)",
                    fontWeight: "400",
                  },
                },
              }}
            />
            {loading && (
              <div className="absolute inset-0 flex items-center justify-center bg-white/20 z-10">
                <HashLoader size={30} color="#660000" />
              </div>
            )}
          </div>
        </div>
      </Fragment>
    </>
  );
};

export default ProductTable;
