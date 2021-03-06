angular.module("supplier-detail.Ctrl", []).controller("supplier-detailCtrl", function ($timeout, $scope, $rootScope, $state, serverDeferred, $ionicModal) {
  $rootScope.hideFooter = true;
  $scope.supplierName = [{ title: "supplierName" }];
  $rootScope.supplierFee = "";
  $scope.$on("$ionicView.loaded", function (ev, info) {
    $scope.selectedConditionAmount = 0;
    $rootScope.ShowLoader();
    $rootScope.dcSuppliers.map((el) => {
      if (el.id == $rootScope.selectSupplierID) {
        $scope.selectedSupplierData = el;
        $rootScope.supplierFee = el.supplierfee;
      }
    });
    $rootScope.isLongTermLeasing = false;
    $scope.supplierName[0].title = $scope.selectedSupplierData.suppliername;
    if ($state.current.name == "supplier-detail") {
      $rootScope.selectedSupplierID = null;
    }
  });

  $rootScope.getbankDataSup = function (a) {
    if (a != "forced") $rootScope.ShowLoader();
    //Шүүгдсэн банкууд
    $rootScope.bankListFilter = [];
    var json = {};

    json.isPerson = "1";
    json.currency = 16074201974821;
    json.isMortgage = 1554263832151;
    json.divide = $rootScope.selected;
    json.salaries = $rootScope.filterSalaries;
    json.location = isEmpty($rootScope.newReqiust.locationId) ? 0 : $rootScope.newReqiust.locationId;

    //банк шүүлт
    if ($state.current.name == "supplier-detail3") {
      json.type = "consumerLeasingFilter";
      json.totalLoan = $rootScope.newReqiust.getLoanAmount;
      json.supplier = $rootScope.selectedSupplierID;
    } else {
      json.type = "divideLoanFilter";
      json.totalLoan = $rootScope.newReqiust.loanAmount;
    }
    json.month = $rootScope.newReqiust.loanMonth;
    json.preTotal = $rootScope.newReqiust.advancePayment;
    serverDeferred.carCalculation(json).then(function (response) {
      $rootScope.bankListFilter = response.result.data;
      $rootScope.HideLoader();
    });
    // console.log("json", json);
  };

  $ionicModal
    .fromTemplateUrl("templates/term-content.html", {
      scope: $scope,
      animation: "slide-in-up",
    })
    .then(function (termModalAgreement) {
      $scope.termModalAgreement = termModalAgreement;
    });
  $scope.$on("$ionicView.enter", function (ev, info) {
    //Тухайн VENDOR ямар2 нөхцөлөөр зээл олгохыг авах VARIABLE
    $rootScope.fidteredSupplierConditions = [];
    //Тухайн VENDOR ямар2 нөхцөлөөр зээл олгохыг авах
    $rootScope.supplierConditions.map((xxx) => {
      if (xxx.dim1 == $rootScope.selectSupplierID) {
        $rootScope.fidteredSupplierConditions.push(xxx);
      }
    });

    $rootScope.isSupLoan = false;
    // $rootScope.newReqiust = {};
    if (!isEmpty($scope.selectedSupplierData)) {
      $rootScope.HideLoader();
    }
    if ($state.current.name == "supplier-detail2") {
      $timeout(function () {
        $scope.getbankDataSup("forced");
      }, 200);
      localStorage.setItem("requestType", "supLoan");
    } else if ($state.current.name == "supplier-detail3") {
      localStorage.setItem("requestType", "consumer");
    }
    localStorage.setItem("isSupplierLoan", "yes");
  });

  $scope.sendRequestFromSupplier = function () {
    $state.go("supplier-detail2");
  };
  $rootScope.selected = "";
  //тухайн нөхцөлийн дэлгэрэнгүй
  $scope.isConditionSelected = false;
  //Хугацаа сонгох үед slider харуулах эсэх
  $scope.isSlideSelected = false;
  $scope.varA = null;
  $scope.selectCondition = function (id) {
    /*if (isEmpty($rootScope.newReqiust.loanAmount)) {
      $rootScope.alert("Зээлийн хэмжээгээ оруулна уу", "warning");
      //uncheck хийх
      $("#captureRad" + id).prop("checked", false);
    } else {*/
    $scope.isConditionSelected = true;
    //hideKeyboard
    document.activeElement.blur();

    $rootScope.fidteredSupplierConditions.map((el) => {
      if (el.id == id) {
        $scope.selectedConditionDetail = el.text1;
        $scope.selectedConditionFee = el.text2;
        $scope.selectedConditionMonth = el.number1 + " хоног";
        $rootScope.newReqiust.loanMonth = el.number1;
        $scope.varA = el.number2;
        $rootScope.selectedSupplierID = el.dim1;
        if (el.text3 == "1") {
          $rootScope.isLongTermLeasing = true;
        } else {
          $rootScope.isLongTermLeasing = false;
        }
        //Хугацаа сонгох үед
        if (el.number2 === "999") {
          $scope.isSlideSelected = true;
          //Slide -н max range
          $scope.maxRange = el.number1;
          $rootScope.selectedMonth = el.number1 - (el.number1 - 1);
          $scope.selectedConditionMonth = 4 + " сар";
          $rootScope.newReqiust.loanMonth = 4;
          $scope.selectedConditionFee = $rootScope.supplierFee + " %";
          $scope.selectedConditionAmount = 0;
        } else {
          if (isEmpty($rootScope.newReqiust.loanAmount)) {
            $scope.selectedConditionAmount = 0;
            $scope.isSlideSelected = false;
          } else {
            $scope.selectedConditionAmount = Math.ceil($rootScope.newReqiust.loanAmount / el.number2);
            $scope.isSlideSelected = false;
          }
        }

        serverDeferred.request("PL_MDVIEW_004", { systemmetagroupid: "1619503143703351", parentId: el.dim1 }).then(function (response) {
          if (!isEmpty(response[0])) {
            $rootScope.subVendor = response;
          } else {
            serverDeferred.request("PL_MDVIEW_004", { systemmetagroupid: "1619503143703351", id: el.dim1 }).then(function (response) {
              $rootScope.subVendor = response;
            });
          }
        });
      }
    });
    $scope.getbankDataSup();
    /*}*/
  };
  function PMT(ir, np, pv, fv, type) {
    /*
     * ir   - interest rate per month
     * np   - number of periods (months)
     * pv   - present value
     * fv   - future value
     * type - when the payments are due:
     *        0: end of the period, e.g. end of month (default)
     *        1: beginning of period
     */
    var pmt, pvif;

    fv || (fv = 0);
    type || (type = 0);

    if (ir === 0) return -(pv + fv) / np;

    pvif = Math.pow(1 + ir, np);
    pmt = (-ir * (pv * pvif + fv)) / (pvif - 1);

    if (type === 1) pmt /= 1 + ir;

    return pmt;
  }
  //slide гүйлгэх
  $scope.selectMonth = function () {
    $scope.selectedConditionMonth = $rootScope.selectedMonth + " сар";
    $rootScope.newReqiust.loanMonth = $rootScope.selectedMonth;
    if (isEmpty($rootScope.newReqiust.loanAmount)) {
      $scope.selectedConditionAmount = 0;
    } else {
      //1 udaagiin tololt bodoh
      $scope.selectedConditionAmount = Math.round(-PMT(parseFloat($rootScope.supplierFee) / 100, $rootScope.selectedMonth, $rootScope.newReqiust.loanAmount));
    }
    $scope.getbankDataSup();
  };
  var loanAmount;
  $scope.changeLoanAmountSupplier = function () {
    loanAmount = $rootScope.newReqiust.loanAmount;
    $rootScope.newReqiust.advancePayment = "";
    if (!isEmpty($rootScope.selected) && $scope.isConditionSelected) {
      if ($scope.isSlideSelected) {
        $scope.selectedConditionAmount = Math.round(-PMT(parseFloat($rootScope.supplierFee) / 100, $rootScope.selectedMonth, $rootScope.newReqiust.loanAmount));
      } else {
        $scope.selectedConditionAmount = Math.ceil($rootScope.newReqiust.loanAmount / $scope.varA);
      }
    }
  };
  $scope.calcLoanAmountSupplier = function () {
    if (!isEmpty($rootScope.newReqiust.loanAmount)) {
      if (parseInt($rootScope.newReqiust.advancePayment) < parseInt(loanAmount)) {
        $rootScope.newReqiust.loanAmount = loanAmount - $rootScope.newReqiust.advancePayment;
      } else if (parseInt($rootScope.newReqiust.advancePayment) > parseInt(loanAmount)) {
        var tmp = $rootScope.newReqiust.advancePayment;
        $rootScope.newReqiust.advancePayment = tmp.slice(0, -1);
      }
    }
  };
  $scope.calcLoanAmountSupplierStep3 = function () {
    if (parseInt($rootScope.newReqiust.advancePayment) < $rootScope.newReqiust.productPrice) {
      $rootScope.newReqiust.getLoanAmount = $rootScope.newReqiust.productPrice - $rootScope.newReqiust.advancePayment;
      $rootScope.newReqiust.loanAmount = $rootScope.newReqiust.getLoanAmount;
    } else if (parseInt($rootScope.newReqiust.advancePayment) > $rootScope.newReqiust.productPrice) {
      var tmp = $rootScope.newReqiust.advancePayment;
      $rootScope.newReqiust.advancePayment = tmp.slice(0, -1);
    }
  };

  $scope.step2Sup = function () {
    if (!$rootScope.isLongTermLeasing && $scope.checkReqiuredSupplierDtl("step2")) {
      if (!$rootScope.isLongTermLeasing && $scope.checkReqiuredSupplierDtl("agreeBankSup")) {
        $state.go("income");
      }
    } else if ($rootScope.isLongTermLeasing) {
      $state.go("supplier-detail3");
    }
  };
  $scope.step3Sup = function () {
    if ($scope.checkReqiuredSupplierDtl("step3")) {
      if ($scope.checkReqiuredSupplierDtl("agreeBankSup")) {
        $state.go("income");
      }
    }
  };

  $scope.checkReqiuredSupplierDtl = function (param) {
    if (param == "step2") {
      if (isEmpty($rootScope.selected)) {
        $rootScope.alert("Зээлийн нөхцөлөө сонгоно уу", "warning");
        return false;
      } else if (isEmpty($rootScope.newReqiust.advancePayment) && $scope.isSlideSelected) {
        $rootScope.alert("Урьдчилгаагаа оруулна уу", "warning");
        return false;
      } else if (isEmpty($rootScope.newReqiust.loanAmount)) {
        $rootScope.alert("Зээлийн хэмжээгээ оруулна уу", "warning");
        return false;
      } else if (isEmpty($rootScope.newReqiust.subVendorId) && $scope.isSlideSelected) {
        $rootScope.alert("Үйлчлүүлэх салбар сонгоно уу", "warning");
        return false;
      } else if (isEmpty($rootScope.newReqiust.locationId) && $scope.isSlideSelected) {
        $rootScope.alert("Байршил сонгоно уу", "warning");
        return false;
      } else if (isEmpty($rootScope.newReqiust.isCoBorrower) && $scope.isSlideSelected) {
        $rootScope.alert("Хамтран зээлдэгчтэй эсэхээ сонгоно уу", "warning");
        return false;
      } else if (isEmpty($rootScope.newReqiust.serviceAgreementId) || $rootScope.newReqiust.serviceAgreementId == 1554263832151) {
        $rootScope.alert("Та үйлчилгээний нөхцлийг зөвшөөрөөгүй байна", "warning");
        return false;
      } else {
        return true;
      }
    } else if (param == "step3") {
      if (isEmpty($rootScope.newReqiust.productPrice)) {
        $rootScope.alert("Барааны үнэ оруулна уу", "warning");
        return false;
      } else if (isEmpty($rootScope.newReqiust.advancePayment)) {
        $rootScope.alert("Урьдчилгаагаа оруулна уу", "warning");
        return false;
      } else if (isEmpty($rootScope.newReqiust.getLoanAmount)) {
        $rootScope.alert("Зээлийн хэмжээгээ оруулна уу", "warning");
        return false;
      } else if (isEmpty($rootScope.newReqiust.subVendorId)) {
        $rootScope.alert("Үйлчлүүлэх салбар сонгоно уу", "warning");
        return false;
      } else if (isEmpty($rootScope.newReqiust.locationId)) {
        $rootScope.alert("Байршил сонгоно уу", "warning");
        return false;
      } else if (isEmpty($rootScope.newReqiust.isCoBorrower)) {
        $rootScope.alert("Хамтран зээлдэгчтэй эсэхээ сонгоно уу", "warning");
        return false;
      } else if (isEmpty($rootScope.newReqiust.serviceAgreementId) || $rootScope.newReqiust.serviceAgreementId == 1554263832151) {
        $rootScope.alert("Та үйлчилгээний нөхцлийг зөвшөөрөөгүй байна", "warning");
        return false;
      } else {
        return true;
      }
    } else if (param == "agreeBankSup") {
      if (isEmpty($rootScope.bankListFilter.Agree)) {
        $rootScope.alert("Таны мэдээллийн дагуу зээл олгох банк, ББСБ байхгүй байна. Та мэдээллээ дахин оруулна уу.", "warning");
        return false;
      } else {
        return true;
      }
    }
  };
});
